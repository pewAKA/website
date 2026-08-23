import type { StructuredData } from 'fumadocs-core/mdx-plugins'

export type DocumentCategory = {
  slug: string
  name: string
  description: string
  order: number
}

export type DocumentTag = {
  slug: string
  name: string
  count: number
}

export type DocumentRecord = {
  id: string
  slugs: string[]
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  featured: boolean
  coverImage?: string
  content: string
}

export interface DocumentRepository {
  list(): Promise<DocumentRecord[]>
  findBySlugs(slugs: string[]): Promise<DocumentRecord | undefined>
  listByCategory(category: string): Promise<DocumentRecord[]>
  listByTag(tag: string): Promise<DocumentRecord[]>
}

export type DocumentPageData = DocumentRecord & {
  structuredData: StructuredData
}

export type DocumentMetaData = {
  title?: string
  description?: string
  pages?: string[]
  defaultOpen?: boolean
}
