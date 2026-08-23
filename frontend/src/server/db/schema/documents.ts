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
    sourceKey: varchar('source_key', { length: 191 }).notNull(),
    readingMinutes: int('reading_minutes').notNull().default(1),
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
