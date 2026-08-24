import 'server-only'
import { and, asc, desc, eq, inArray, isNotNull } from 'drizzle-orm'
import type { DocumentRecord, DocumentRepository } from '@/lib/docs/types'
import { estimateReadingMinutes } from '@/lib/docs/reading-time'
import { sortByUpdatedAt } from '@/lib/docs/repository'
import { db } from '@/server/db/client'
import {
  articleCategories,
  articleTagRelations,
  articles,
  articleTags,
} from '@/server/db/schema/business'
import { articleDocumentMetadata } from '@/server/db/schema/documents'

function toIsoString(value: Date) {
  return value.toISOString()
}

async function listPublishedDocuments(): Promise<DocumentRecord[]> {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      description: articles.summary,
      content: articles.content,
      coverImage: articles.coverImageUrl,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
      category: articleCategories.slug,
      categoryName: articleCategories.name,
      readingMinutes: articleDocumentMetadata.readingMinutes,
      featured: articleDocumentMetadata.featured,
    })
    .from(articles)
    .innerJoin(articleCategories, eq(articleCategories.id, articles.categoryId))
    .leftJoin(articleDocumentMetadata, eq(articleDocumentMetadata.articleId, articles.id))
    .where(
      and(
        eq(articles.status, 'PUBLISHED'),
        isNotNull(articles.publishedAt),
        eq(articleCategories.enabled, true),
      ),
    )
    .orderBy(desc(articles.updatedAt), desc(articles.id))

  const articleIds = rows.map((row) => row.id)
  const tagRows =
    articleIds.length === 0
      ? []
      : await db
          .select({
            articleId: articleTagRelations.articleId,
            name: articleTags.name,
          })
          .from(articleTagRelations)
          .innerJoin(articleTags, eq(articleTags.id, articleTagRelations.tagId))
          .where(inArray(articleTagRelations.articleId, articleIds))
          .orderBy(asc(articleTags.name))

  const tagsByArticle = new Map<number, string[]>()
  for (const row of tagRows) {
    const tags = tagsByArticle.get(row.articleId) ?? []
    tags.push(row.name)
    tagsByArticle.set(row.articleId, tags)
  }

  return rows.map((row) => ({
    id: String(row.id),
    slugs: [row.category, row.slug],
    title: row.title,
    description: row.description,
    category: row.category,
    categoryName: row.categoryName,
    tags: tagsByArticle.get(row.id) ?? [],
    publishedAt: toIsoString(row.publishedAt!),
    updatedAt: toIsoString(row.updatedAt),
    readingMinutes: row.readingMinutes ?? estimateReadingMinutes(row.content),
    featured: row.featured ?? false,
    coverImage: row.coverImage || undefined,
    content: row.content,
  }))
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('en-US')
}

/** 公开页面只读取已发布文章；管理后台仍使用独立的 ArticleRepository。 */
export const databaseDocumentRepository: DocumentRepository = {
  list: listPublishedDocuments,
  async findBySlugs(slugs) {
    const key = slugs.join('/')
    return (await listPublishedDocuments()).find((document) => document.slugs.join('/') === key)
  },
  async listByCategory(category) {
    const expected = normalized(category)
    return sortByUpdatedAt(
      (await listPublishedDocuments()).filter(
        (document) => normalized(document.category) === expected,
      ),
    )
  },
  async listByTag(tag) {
    const expected = normalized(tag)
    return sortByUpdatedAt(
      (await listPublishedDocuments()).filter((document) =>
        document.tags.some((item) => normalized(item) === expected),
      ),
    )
  },
}

export async function getRecentDatabaseDocuments(limit = 2) {
  return sortByUpdatedAt(await databaseDocumentRepository.list()).slice(0, limit)
}
