import 'server-only'
import { asc, count, desc, eq, inArray, sql } from 'drizzle-orm'
import type { Article, ArticleCategory, ArticleTag, PageResponse } from '@/lib/articles/types'
import { estimateReadingMinutes } from '@/lib/docs/reading-time'
import { db } from '@/server/db/client'
import {
  articleCategories,
  articleTagRelations,
  articles,
  articleTags,
} from '@/server/db/schema/business'
import { articleDocumentMetadata } from '@/server/db/schema/documents'
import type { ArticleUpsertInput, TaxonomyUpsertInput } from '@/server/validation/articles'
import { ApiError } from '@/server/http/errors'

type ArticleStatus = Article['status']

function formatDate(value: Date) {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return formatter.format(value).replace(' ', 'T')
}

const articleSelection = {
  id: articles.id,
  title: articles.title,
  slug: articles.slug,
  summary: articles.summary,
  content: articles.content,
  coverImageUrl: articles.coverImageUrl,
  status: articles.status,
  publishedAt: articles.publishedAt,
  createdAt: articles.createdAt,
  updatedAt: articles.updatedAt,
  categoryId: articleCategories.id,
  categoryName: articleCategories.name,
  categorySlug: articleCategories.slug,
  categoryEnabled: articleCategories.enabled,
  featured: articleDocumentMetadata.featured,
  readingMinutes: articleDocumentMetadata.readingMinutes,
}

type SelectedArticle = Awaited<ReturnType<typeof selectArticleById>>

async function selectArticleById(id: number) {
  const [row] = await db
    .select(articleSelection)
    .from(articles)
    .innerJoin(articleCategories, eq(articleCategories.id, articles.categoryId))
    .leftJoin(articleDocumentMetadata, eq(articleDocumentMetadata.articleId, articles.id))
    .where(eq(articles.id, id))
    .limit(1)
  return row
}

async function selectArticleTags(articleId: number): Promise<ArticleTag[]> {
  const rows = await db
    .select({ id: articleTags.id, name: articleTags.name, slug: articleTags.slug })
    .from(articleTags)
    .innerJoin(articleTagRelations, eq(articleTagRelations.tagId, articleTags.id))
    .where(eq(articleTagRelations.articleId, articleId))
    .orderBy(asc(articleTags.name))
  return rows.map((tag) => ({ ...tag, articleCount: null }))
}

async function hydrateArticle(row: NonNullable<SelectedArticle>): Promise<Article> {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    coverImageUrl: row.coverImageUrl,
    status: row.status as ArticleStatus,
    publishedAt: row.publishedAt ? formatDate(row.publishedAt) : null,
    createdAt: formatDate(row.createdAt),
    updatedAt: formatDate(row.updatedAt),
    category: {
      id: row.categoryId,
      name: row.categoryName,
      slug: row.categorySlug,
      sortOrder: null,
      enabled: row.categoryEnabled,
      articleCount: null,
    },
    tags: await selectArticleTags(row.id),
    documentMeta: {
      featured: row.featured ?? false,
      readingMinutes: row.readingMinutes,
      estimatedReadingMinutes: estimateReadingMinutes(row.content),
    },
  }
}

export interface ArticleRepository {
  listAdmin(
    status: ArticleStatus | undefined,
    page: number,
    pageSize: number,
  ): Promise<PageResponse<Article>>
  findArticleById(id: number): Promise<Article | undefined>
  findCategoryById(id: number): Promise<ArticleCategory | undefined>
  countTagsByIds(ids: number[]): Promise<number>
  createArticle(input: ArticleUpsertInput): Promise<number>
  updateArticle(id: number, input: ArticleUpsertInput): Promise<void>
  publishArticle(id: number): Promise<void>
  unpublishArticle(id: number): Promise<void>
  deleteArticle(id: number): Promise<void>
  listCategories(): Promise<ArticleCategory[]>
  createCategory(input: TaxonomyUpsertInput): Promise<number>
  updateCategory(id: number, input: TaxonomyUpsertInput): Promise<void>
  deleteCategoryIfUnused(id: number): Promise<boolean>
  listTags(): Promise<ArticleTag[]>
  findTagById(id: number): Promise<ArticleTag | undefined>
  createTag(input: TaxonomyUpsertInput): Promise<number>
  updateTag(id: number, input: TaxonomyUpsertInput): Promise<void>
  deleteTagIfUnused(id: number): Promise<boolean>
}

export const mysqlArticleRepository: ArticleRepository = {
  async listAdmin(status, page, pageSize) {
    const condition = status ? eq(articles.status, status) : undefined
    const rows = await db
      .select(articleSelection)
      .from(articles)
      .innerJoin(articleCategories, eq(articleCategories.id, articles.categoryId))
      .leftJoin(articleDocumentMetadata, eq(articleDocumentMetadata.articleId, articles.id))
      .where(condition)
      .orderBy(
        desc(sql`COALESCE(${articles.publishedAt}, ${articles.updatedAt})`),
        desc(articles.id),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize)
    const [{ value: total }] = await db.select({ value: count() }).from(articles).where(condition)
    return { items: await Promise.all(rows.map(hydrateArticle)), total, page, pageSize }
  },

  async findArticleById(id) {
    const row = await selectArticleById(id)
    return row ? hydrateArticle(row) : undefined
  },

  async findCategoryById(id) {
    const [row] = await db
      .select({
        id: articleCategories.id,
        name: articleCategories.name,
        slug: articleCategories.slug,
        sortOrder: articleCategories.sortOrder,
        enabled: articleCategories.enabled,
      })
      .from(articleCategories)
      .where(eq(articleCategories.id, id))
      .limit(1)
    return row ? { ...row, articleCount: null } : undefined
  },

  async countTagsByIds(ids) {
    if (ids.length === 0) return 0
    const [{ value }] = await db
      .select({ value: count() })
      .from(articleTags)
      .where(inArray(articleTags.id, ids))
    return value
  },

  async createArticle(input) {
    return db.transaction(async (transaction) => {
      // 业务表没有外键，因此在同一事务内锁定 taxonomy，避免校验后被并发删除。
      const [category] = await transaction
        .select({ enabled: articleCategories.enabled })
        .from(articleCategories)
        .where(eq(articleCategories.id, input.categoryId))
        .limit(1)
        .for('update')
      if (!category?.enabled) {
        throw new ApiError(400, 'VALIDATION_ERROR', '请选择一个启用中的分类')
      }
      if (input.tagIds.length > 0) {
        const lockedTags = await transaction
          .select({ id: articleTags.id })
          .from(articleTags)
          .where(inArray(articleTags.id, input.tagIds))
          .for('update')
        if (lockedTags.length !== input.tagIds.length) {
          throw new ApiError(400, 'VALIDATION_ERROR', '所选标签不存在')
        }
      }
      const [result] = await transaction.insert(articles).values({
        categoryId: input.categoryId,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        content: input.content,
        coverImageUrl: input.coverImageUrl || null,
        status: 'DRAFT',
      })
      const id = result.insertId
      if (input.tagIds.length > 0) {
        await transaction
          .insert(articleTagRelations)
          .values(input.tagIds.map((tagId) => ({ articleId: id, tagId })))
      }
      await transaction.insert(articleDocumentMetadata).values({
        articleId: id,
        sourceKey: null,
        featured: input.documentMeta.featured,
        readingMinutes: input.documentMeta.readingMinutes,
      })
      return id
    })
  },

  async updateArticle(id, input) {
    await db.transaction(async (transaction) => {
      const [category] = await transaction
        .select({ enabled: articleCategories.enabled })
        .from(articleCategories)
        .where(eq(articleCategories.id, input.categoryId))
        .limit(1)
        .for('update')
      if (!category?.enabled) {
        throw new ApiError(400, 'VALIDATION_ERROR', '请选择一个启用中的分类')
      }
      if (input.tagIds.length > 0) {
        const lockedTags = await transaction
          .select({ id: articleTags.id })
          .from(articleTags)
          .where(inArray(articleTags.id, input.tagIds))
          .for('update')
        if (lockedTags.length !== input.tagIds.length) {
          throw new ApiError(400, 'VALIDATION_ERROR', '所选标签不存在')
        }
      }
      await transaction
        .update(articles)
        .set({
          categoryId: input.categoryId,
          title: input.title,
          slug: input.slug,
          summary: input.summary,
          content: input.content,
          coverImageUrl: input.coverImageUrl || null,
        })
        .where(eq(articles.id, id))
      await transaction.delete(articleTagRelations).where(eq(articleTagRelations.articleId, id))
      if (input.tagIds.length > 0) {
        await transaction
          .insert(articleTagRelations)
          .values(input.tagIds.map((tagId) => ({ articleId: id, tagId })))
      }
      // 只更新可编辑元数据，保留 mock:* 来源标识，避免后台保存后丢失种子归属。
      await transaction
        .insert(articleDocumentMetadata)
        .values({
          articleId: id,
          sourceKey: null,
          featured: input.documentMeta.featured,
          readingMinutes: input.documentMeta.readingMinutes,
        })
        .onDuplicateKeyUpdate({
          set: {
            featured: input.documentMeta.featured,
            readingMinutes: input.documentMeta.readingMinutes,
            updatedAt: new Date(),
          },
        })
    })
  },

  async publishArticle(id) {
    await db
      .update(articles)
      .set({ status: 'PUBLISHED', publishedAt: new Date() })
      .where(eq(articles.id, id))
  },

  async unpublishArticle(id) {
    await db.update(articles).set({ status: 'DRAFT', publishedAt: null }).where(eq(articles.id, id))
  },

  async deleteArticle(id) {
    await db.transaction(async (transaction) => {
      await transaction.delete(articleTagRelations).where(eq(articleTagRelations.articleId, id))
      // 文档元数据没有数据库外键，删除文章时由应用层同步清理。
      await transaction
        .delete(articleDocumentMetadata)
        .where(eq(articleDocumentMetadata.articleId, id))
      await transaction.delete(articles).where(eq(articles.id, id))
    })
  },

  async listCategories() {
    const rows = await db
      .select({
        id: articleCategories.id,
        name: articleCategories.name,
        slug: articleCategories.slug,
        sortOrder: articleCategories.sortOrder,
        enabled: articleCategories.enabled,
        articleCount: count(articles.id),
      })
      .from(articleCategories)
      .leftJoin(articles, eq(articles.categoryId, articleCategories.id))
      .groupBy(articleCategories.id)
      .orderBy(asc(articleCategories.sortOrder), asc(articleCategories.name))
    return rows
  },

  async createCategory(input) {
    const [result] = await db.insert(articleCategories).values(input)
    return result.insertId
  },

  async updateCategory(id, input) {
    await db.update(articleCategories).set(input).where(eq(articleCategories.id, id))
  },

  async deleteCategoryIfUnused(id) {
    return db.transaction(async (transaction) => {
      const [category] = await transaction
        .select({ id: articleCategories.id })
        .from(articleCategories)
        .where(eq(articleCategories.id, id))
        .limit(1)
        .for('update')
      if (!category) return false
      const [{ value }] = await transaction
        .select({ value: count() })
        .from(articles)
        .where(eq(articles.categoryId, id))
      if (value > 0) return false
      const [result] = await transaction
        .delete(articleCategories)
        .where(eq(articleCategories.id, id))
      return result.affectedRows === 1
    })
  },

  async listTags() {
    return db
      .select({
        id: articleTags.id,
        name: articleTags.name,
        slug: articleTags.slug,
        articleCount: count(articleTagRelations.articleId),
      })
      .from(articleTags)
      .leftJoin(articleTagRelations, eq(articleTagRelations.tagId, articleTags.id))
      .groupBy(articleTags.id)
      .orderBy(asc(articleTags.name))
  },

  async findTagById(id) {
    const [row] = await db
      .select({ id: articleTags.id, name: articleTags.name, slug: articleTags.slug })
      .from(articleTags)
      .where(eq(articleTags.id, id))
      .limit(1)
    return row ? { ...row, articleCount: null } : undefined
  },

  async createTag(input) {
    const [result] = await db.insert(articleTags).values({ name: input.name, slug: input.slug })
    return result.insertId
  },

  async updateTag(id, input) {
    await db
      .update(articleTags)
      .set({ name: input.name, slug: input.slug })
      .where(eq(articleTags.id, id))
  },

  async deleteTagIfUnused(id) {
    return db.transaction(async (transaction) => {
      const [tag] = await transaction
        .select({ id: articleTags.id })
        .from(articleTags)
        .where(eq(articleTags.id, id))
        .limit(1)
        .for('update')
      if (!tag) return false
      const [{ value }] = await transaction
        .select({ value: count() })
        .from(articleTagRelations)
        .where(eq(articleTagRelations.tagId, id))
      if (value > 0) return false
      const [result] = await transaction.delete(articleTags).where(eq(articleTags.id, id))
      return result.affectedRows === 1
    })
  },
}
