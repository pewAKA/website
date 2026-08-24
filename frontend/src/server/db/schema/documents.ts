import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  datetime,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

/**
 * 公开文档的扩展元数据单独存放，避免修改由旧 Spring 应用创建的 article 表。
 * article_id 不设置外键，保持与既有业务表“由应用层维护关系”的约定一致。
 */
export const articleDocumentMetadata = mysqlTable(
  'article_document_meta',
  {
    articleId: bigint('article_id', { mode: 'number' }).primaryKey(),
    // 后台手工创建的文章没有种子来源；仅导入脚本写入 sourceKey。
    sourceKey: varchar('source_key', { length: 191 }),
    // null 表示使用正文自动估算值，管理员填写时作为展示覆盖值。
    readingMinutes: int('reading_minutes'),
    featured: boolean('featured').notNull().default(false),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex('uk_article_document_meta_source').on(table.sourceKey)],
)
