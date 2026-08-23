import type { MetadataRoute } from 'next'
import { documentCategories } from '@/lib/docs/mock-documents'
import {
  createDocumentTags,
  getCategoryHref,
  getDocumentHref,
  getTagHref,
  mockDocumentRepository,
} from '@/lib/docs/repository'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const documents = await mockDocumentRepository.list()
  const tags = createDocumentTags(documents)
  const staticRoutes = ['/', '/works', '/about', '/roadmap', '/articles']

  return [
    ...staticRoutes.map((route) => ({ url: `${siteUrl}${route}`, changeFrequency: 'weekly' as const })),
    ...documentCategories.map((category) => ({
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
