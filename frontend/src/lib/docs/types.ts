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
  /** 数据库分类展示名；本地 Mock 可继续通过静态分类配置补齐。 */
  categoryName?: string
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
