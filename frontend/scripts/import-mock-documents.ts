import { and, eq, inArray, ne, or } from 'drizzle-orm'
import { documentCategories, mockDocuments } from '../src/lib/docs/mock-documents'
import { getTagSlug } from '../src/lib/docs/repository'
import {
  articleCategories,
  articleTagRelations,
  articles,
  articleTags,
} from '../src/server/db/schema/business'
import { articleDocumentMetadata } from '../src/server/db/schema/documents'
import { loadNextEnv } from './load-env'

// 独立导入脚本也需要读取 .env.local；生产容器已有环境变量时不会覆盖。
loadNextEnv()

const { db, pool } = await import('../src/server/db/client')

const categoryConfig = new Map(documentCategories.map((category) => [category.slug, category]))
let inserted = 0
let updated = 0
let skipped = 0
const forceUpdate = process.argv.includes('--force-update')

try {
  if (forceUpdate) {
    const sourceKeys = mockDocuments.map((document) => `mock:${document.id}`)
    const existing = await db
      .select({ sourceKey: articleDocumentMetadata.sourceKey })
      .from(articleDocumentMetadata)
      .where(inArray(articleDocumentMetadata.sourceKey, sourceKeys))
    const overwrite = new Set(existing.flatMap((item) => (item.sourceKey ? [item.sourceKey] : [])))
    const titles = mockDocuments
      .filter((document) => overwrite.has(`mock:${document.id}`))
      .map((document) => `- ${document.title}`)
    console.log(`--force-update 将覆盖以下 ${titles.length} 篇受管种子：`)
    console.log(titles.length > 0 ? titles.join('\n') : '- 无（本次只会新增缺失种子）')
  }

  await db.transaction(async (transaction) => {
    const categoryIds = new Map<string, number>()

    for (const category of documentCategories) {
      const matches = await transaction
        .select({
          id: articleCategories.id,
          name: articleCategories.name,
          slug: articleCategories.slug,
        })
        .from(articleCategories)
        .where(
          or(eq(articleCategories.slug, category.slug), eq(articleCategories.name, category.name)),
        )

      const slugMatch = matches.find((item) => item.slug === category.slug)
      const nameConflict = matches.find(
        (item) => item.name === category.name && item.slug !== category.slug,
      )
      if (nameConflict) {
        throw new Error(`分类名称“${category.name}”已被 slug=${nameConflict.slug} 使用，导入已取消`)
      }

      if (slugMatch) {
        if (forceUpdate) {
          await transaction
            .update(articleCategories)
            .set({ name: category.name, sortOrder: category.order, enabled: true })
            .where(eq(articleCategories.id, slugMatch.id))
        }
        categoryIds.set(category.slug, slugMatch.id)
      } else {
        const [result] = await transaction.insert(articleCategories).values({
          name: category.name,
          slug: category.slug,
          sortOrder: category.order,
          enabled: true,
        })
        categoryIds.set(category.slug, result.insertId)
      }
    }

    const tagIds = new Map<string, number>()
    const uniqueTags = [...new Set(mockDocuments.flatMap((document) => document.tags))]
    for (const name of uniqueTags) {
      const slug = getTagSlug(name)
      const matches = await transaction
        .select({ id: articleTags.id, name: articleTags.name, slug: articleTags.slug })
        .from(articleTags)
        .where(or(eq(articleTags.slug, slug), eq(articleTags.name, name)))

      const slugMatch = matches.find((item) => item.slug === slug)
      const nameConflict = matches.find((item) => item.name === name && item.slug !== slug)
      if (nameConflict) {
        throw new Error(`标签名称“${name}”已被 slug=${nameConflict.slug} 使用，导入已取消`)
      }

      if (slugMatch) {
        if (forceUpdate) {
          await transaction.update(articleTags).set({ name }).where(eq(articleTags.id, slugMatch.id))
        }
        tagIds.set(name, slugMatch.id)
      } else {
        const [result] = await transaction.insert(articleTags).values({ name, slug })
        tagIds.set(name, result.insertId)
      }
    }

    for (const document of mockDocuments) {
      const slug = document.slugs.at(-1)
      const categoryId = categoryIds.get(document.category)
      const category = categoryConfig.get(document.category)
      if (!slug || !categoryId || !category) {
        throw new Error(`Mock 文档 ${document.id} 的路径或分类配置不完整`)
      }

      const sourceKey = `mock:${document.id}`
      const [metadata] = await transaction
        .select({ articleId: articleDocumentMetadata.articleId })
        .from(articleDocumentMetadata)
        .where(eq(articleDocumentMetadata.sourceKey, sourceKey))
        .limit(1)

      let articleId = metadata?.articleId
      if (articleId) {
        const [ownedArticle] = await transaction
          .select({ id: articles.id })
          .from(articles)
          .where(eq(articles.id, articleId))
          .limit(1)
        if (!ownedArticle) throw new Error(`导入来源 ${sourceKey} 指向不存在的文章`)

        const [slugConflict] = await transaction
          .select({ id: articles.id })
          .from(articles)
          .where(and(eq(articles.slug, slug), ne(articles.id, articleId)))
          .limit(1)
        if (slugConflict) {
          throw new Error(`文章 slug=${slug} 已被其他文章使用，导入已取消`)
        }

        if (!forceUpdate) {
          // 已存在的受管种子默认视为后台内容，避免再次导入覆盖管理员修改。
          skipped += 1
          continue
        }
      } else {
        const [slugConflict] = await transaction
          .select({ id: articles.id })
          .from(articles)
          .where(eq(articles.slug, slug))
          .limit(1)
        if (slugConflict) {
          throw new Error(`文章 slug=${slug} 已存在但不属于 Mock 导入，导入已取消`)
        }

        const [result] = await transaction.insert(articles).values({
          categoryId,
          title: document.title,
          slug,
          summary: document.description,
          content: document.content.trim(),
          coverImageUrl: document.coverImage || null,
          status: 'PUBLISHED',
          publishedAt: new Date(document.publishedAt),
          createdAt: new Date(document.publishedAt),
          updatedAt: new Date(document.updatedAt),
        })
        articleId = result.insertId
        inserted += 1

        await transaction.insert(articleDocumentMetadata).values({
          articleId,
          sourceKey,
          readingMinutes: document.readingMinutes,
          featured: document.featured,
          createdAt: new Date(document.publishedAt),
          updatedAt: new Date(document.updatedAt),
        })
      }

      if (!articleId) throw new Error(`Mock 文档 ${document.id} 未能取得数据库主键`)

      if (metadata) {
        await transaction
          .update(articles)
          .set({
            categoryId,
            title: document.title,
            slug,
            summary: document.description,
            content: document.content.trim(),
            coverImageUrl: document.coverImage || null,
            status: 'PUBLISHED',
            publishedAt: new Date(document.publishedAt),
            updatedAt: new Date(document.updatedAt),
          })
          .where(eq(articles.id, articleId))
        await transaction
          .update(articleDocumentMetadata)
          .set({
            readingMinutes: document.readingMinutes,
            featured: document.featured,
            updatedAt: new Date(document.updatedAt),
          })
          .where(eq(articleDocumentMetadata.articleId, articleId))
        updated += 1
      }

      await transaction
        .delete(articleTagRelations)
        .where(eq(articleTagRelations.articleId, articleId))
      const documentTagIds = document.tags.map((tag) => tagIds.get(tag))
      if (documentTagIds.some((id) => id === undefined)) {
        throw new Error(`Mock 文档 ${document.id} 存在未创建的标签`)
      }
      await transaction
        .insert(articleTagRelations)
        .values(documentTagIds.map((tagId) => ({ articleId, tagId: tagId! })))
    }
  })

  console.log(
    `Mock 文档导入完成：新增 ${inserted} 篇，更新 ${updated} 篇，跳过 ${skipped} 篇，共 ${mockDocuments.length} 篇`,
  )
} finally {
  await pool.end()
}
