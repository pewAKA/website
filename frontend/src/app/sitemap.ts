import type { MetadataRoute } from 'next'
import {
  createDocumentCategories,
  createDocumentTags,
  getCategoryHref,
  getDocumentHref,
  getTagHref,
} from '@/lib/docs/repository'
import { databaseDocumentRepository } from '@/server/repositories/document-repository'
import type { DocumentRepository } from '@/lib/docs/types'

export const dynamic = 'force-dynamic'

export async function createSitemap(
  repository: DocumentRepository,
): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const documents = await repository.list()
  const categories = createDocumentCategories(documents)
  const tags = createDocumentTags(documents)
  const staticRoutes = ['/', '/works', '/about', '/roadmap', '/articles']

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: 'weekly' as const,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}${getCategoryHref(category.slug)}`,
      changeFrequency: 'weekly' as const,
    })),
    ...tags.map((tag) => ({
      url: `${siteUrl}${getTagHref(tag.name)}`,
      changeFrequency: 'weekly' as const,
    })),
    ...documents.map((document) => ({
      url: `${siteUrl}${getDocumentHref(document)}`,
      lastModified: new Date(document.updatedAt),
      changeFrequency: 'monthly' as const,
    })),
  ]
}

export default function sitemap() {
  return createSitemap(databaseDocumentRepository)
}
