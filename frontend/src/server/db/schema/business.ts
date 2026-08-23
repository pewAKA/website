import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  mediumtext,
  mysqlTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

const createdAt = () =>
  datetime('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
const updatedAt = () =>
  datetime('updated_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)

/** 映射既有 MySQL 表；首次 Next.js 切换不会重建或修改这些业务表。 */
export const articleCategories = mysqlTable(
  'article_category',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    slug: varchar('slug', { length: 80 }).notNull(),
    sortOrder: int('sort_order').notNull().default(0),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('uk_article_category_name').on(table.name),
    uniqueIndex('uk_article_category_slug').on(table.slug),
  ],
)

export const articleTags = mysqlTable(
  'article_tag',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    slug: varchar('slug', { length: 80 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('uk_article_tag_name').on(table.name),
    uniqueIndex('uk_article_tag_slug').on(table.slug),
  ],
)

export const articles = mysqlTable(
  'article',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    categoryId: bigint('category_id', { mode: 'number' }).notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 180 }).notNull(),
    summary: varchar('summary', { length: 360 }).notNull(),
    content: mediumtext('content').notNull(),
    coverImageUrl: varchar('cover_image_url', { length: 500 }),
    status: varchar('status', { length: 16 }).notNull().default('DRAFT'),
    publishedAt: datetime('published_at', { mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('uk_article_slug').on(table.slug),
    index('idx_article_publication').on(table.status, table.publishedAt),
    index('idx_article_category').on(table.categoryId),
  ],
)

export const articleTagRelations = mysqlTable(
  'article_tag_relation',
  {
    articleId: bigint('article_id', { mode: 'number' }).notNull(),
    tagId: bigint('tag_id', { mode: 'number' }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.tagId] }),
    index('idx_article_tag_relation_tag').on(table.tagId),
  ],
)

/** 仅用于标记遗留表，Next.js 鉴权不会读取这里的数据。 */
export const legacySystemUsers = mysqlTable(
  'sys_user',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    username: varchar('username', { length: 64 }).notNull(),
    passwordHash: varchar('password_hash', { length: 100 }).notNull(),
    role: varchar('role', { length: 32 }).notNull(),
    enabled: boolean('enabled').notNull().default(true),
    tokenVersion: bigint('token_version', { mode: 'number' }).notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex('uk_sys_user_username').on(table.username)],
)
