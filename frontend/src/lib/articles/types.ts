export type ArticleCategory = {
  id: number
  name: string
  slug: string
  sortOrder: number | null
  enabled: boolean
  articleCount: number | null
}

export type ArticleTag = {
  id: number
  name: string
  slug: string
  articleCount: number | null
}

export type ArticleDocumentMeta = {
  featured: boolean
  /** null 表示由正文自动估算阅读时长。 */
  readingMinutes: number | null
  estimatedReadingMinutes: number
}

export type Article = {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  coverImageUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  category: ArticleCategory
  tags: ArticleTag[]
  documentMeta: ArticleDocumentMeta
}

export type PageResponse<T> = { items: T[]; total: number; page: number; pageSize: number }

export type ArticlePayload = {
  title: string
  slug: string
  summary: string
  content: string
  coverImageUrl?: string
  categoryId: number
  tagIds: number[]
  documentMeta: Pick<ArticleDocumentMeta, 'featured' | 'readingMinutes'>
}

export type TaxonomyPayload = {
  name: string
  slug: string
  sortOrder?: number
  enabled?: boolean
}

export type ChangePasswordPayload = { currentPassword: string; newPassword: string }
export type AdminArticleListParams = { status?: string; page?: number; pageSize?: number }
