import { notFound } from 'next/navigation'
import { ArticleDocument } from '@/features/Docs/ArticleDocument'
import { articleService } from '@/server/services/article-service'
import { positiveIdSchema } from '@/server/validation/articles'

export default async function SavedDocumentPreview({ params }: { params: Promise<{ id: string }> }) {
  const parsed = positiveIdSchema.safeParse((await params).id)
  if (!parsed.success) notFound()

  let article
  try {
    article = await articleService.getAdmin(parsed.data)
  } catch {
    notFound()
  }

  return (
    <ArticleDocument
      preview
      document={{
        id: String(article.id),
        slugs: [article.category.slug, article.slug],
        title: article.title,
        description: article.summary,
        category: article.category.slug,
        categoryName: article.category.name,
        tags: article.tags.map((tag) => tag.name),
        publishedAt: article.publishedAt || article.updatedAt,
        updatedAt: article.updatedAt,
        readingMinutes:
          article.documentMeta.readingMinutes ?? article.documentMeta.estimatedReadingMinutes,
        featured: article.documentMeta.featured,
        coverImage: article.coverImageUrl || undefined,
        content: article.content,
      }}
    />
  )
}
