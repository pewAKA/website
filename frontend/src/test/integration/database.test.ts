import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createPool, type Pool, type RowDataPacket } from 'mysql2/promise'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import type { ArticleRepository } from '@/server/repositories/article-repository'

const testDatabaseUrl = process.env.TEST_DATABASE_URL
const integrationSuite = testDatabaseUrl ? describe : describe.skip

interface IdRow extends RowDataPacket { id: number }
interface TableRow extends RowDataPacket { tableName: string }
interface CountRow extends RowDataPacket { count: number }

integrationSuite('MySQL 8 迁移与文章事务', () => {
  let setupPool: Pool
  let applicationPool: Pool
  let repository: ArticleRepository

  beforeAll(async () => {
    const url = new URL(testDatabaseUrl!)
    if (!url.pathname.endsWith('_test')) {
      throw new Error('TEST_DATABASE_URL 必须指向以 _test 结尾的隔离数据库')
    }

    process.env.DATABASE_URL = testDatabaseUrl
    process.env.BETTER_AUTH_SECRET ||= 'integration-test-secret-at-least-32-characters'
    setupPool = createPool(testDatabaseUrl!)

    const businessTables = [
      `CREATE TABLE IF NOT EXISTS article_category (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(64) NOT NULL,
        slug VARCHAR(80) NOT NULL, sort_order INT NOT NULL DEFAULT 0,
        enabled TINYINT(1) NOT NULL DEFAULT 1, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_article_category_name (name), UNIQUE KEY uk_article_category_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS article_tag (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(64) NOT NULL,
        slug VARCHAR(80) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_article_tag_name (name), UNIQUE KEY uk_article_tag_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS article (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, category_id BIGINT NOT NULL,
        title VARCHAR(160) NOT NULL, slug VARCHAR(180) NOT NULL, summary VARCHAR(360) NOT NULL,
        content MEDIUMTEXT NOT NULL, cover_image_url VARCHAR(500), status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
        published_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_article_slug (slug), KEY idx_article_publication (status, published_at),
        KEY idx_article_category (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS article_tag_relation (
        article_id BIGINT NOT NULL, tag_id BIGINT NOT NULL,
        PRIMARY KEY (article_id, tag_id), KEY idx_article_tag_relation_tag (tag_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS sys_user (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(64) NOT NULL,
        password_hash VARCHAR(100) NOT NULL, role VARCHAR(32) NOT NULL,
        enabled TINYINT(1) NOT NULL DEFAULT 1, token_version BIGINT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_sys_user_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    ]
    for (const statement of businessTables) await setupPool.execute(statement)

    await setupPool.execute('DELETE FROM article_tag_relation')
    await setupPool.execute('DELETE FROM article')
    await setupPool.execute('DELETE FROM article_tag')
    await setupPool.execute('DELETE FROM article_category')
    await setupPool.execute(
      "INSERT INTO article_category (id, name, slug, enabled) VALUES (101, '前端架构', 'frontend-architecture', 1)",
    )
    await setupPool.execute("INSERT INTO article_tag (id, name, slug) VALUES (201, 'Next.js', 'nextjs')")
    await setupPool.execute(
      "INSERT INTO article (id, category_id, title, slug, summary, content) VALUES (301, 101, '基线文章', 'baseline-article', '摘要', '# 正文')",
    )
    await setupPool.execute('INSERT INTO article_tag_relation (article_id, tag_id) VALUES (301, 201)')

    const database = await import('@/server/db/client')
    applicationPool = database.pool
    await migrate(database.db, {
      migrationsFolder: './drizzle',
      migrationsTable: '__drizzle_migrations__',
    })
    repository = (await import('@/server/repositories/article-repository')).mysqlArticleRepository
  })

  afterAll(async () => {
    await applicationPool?.end()
    await setupPool?.end()
  })

  it('Auth 迁移不会重建或清空既有业务数据', async () => {
    const [articles] = await setupPool.query<IdRow[]>('SELECT id FROM article ORDER BY id')
    const [authTables] = await setupPool.query<TableRow[]>(
      "SELECT table_name AS tableName FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE 'auth_%'",
    )
    expect(articles.map((row) => Number(row.id))).toEqual([301])
    expect(authTables).toHaveLength(4)
  })

  it('创建文章与标签关系在同一事务中提交', async () => {
    const id = await repository.createArticle({
      title: '事务文章', slug: 'transaction-article', summary: '摘要', content: '# 正文',
      categoryId: 101, tagIds: [201],
    })
    const [relations] = await setupPool.query<CountRow[]>(
      'SELECT COUNT(*) AS count FROM article_tag_relation WHERE article_id = ?',
      [id],
    )
    expect(Number(relations[0]?.count)).toBe(1)
  })

  it('标签关系写入失败时完整回滚新文章', async () => {
    await expect(repository.createArticle({
      title: '回滚文章', slug: 'rollback-article', summary: '摘要', content: '# 正文',
      categoryId: 101, tagIds: [201, 201],
    })).rejects.toBeDefined()
    const [rows] = await setupPool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM article WHERE slug = 'rollback-article'",
    )
    expect(Number(rows[0]?.count)).toBe(0)
  })
})
