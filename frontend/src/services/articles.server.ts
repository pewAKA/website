import type {
  ApiResponse,
  Article,
  ArticleListParams,
  PageResponse,
  Taxonomy,
} from '@/services/articles'

const apiOrigin = (process.env.API_ORIGIN || 'http://127.0.0.1:8081').replace(/\/$/, '')
const publicCache = { revalidate: 60, tags: ['articles'] }

export class ArticleApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ArticleApiError'
  }
}

async function getPublicApi<T>(path: string, params?: URLSearchParams) {
  const query = params?.toString()
  const url = `${apiOrigin}/api${path}${query ? `?${query}` : ''}`
  const response = await fetch(url, { next: publicCache })
  let body: ApiResponse<T> | null = null

  try {
    body = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ArticleApiError('文章服务返回了无法识别的数据。', response.status)
  }

  if (!response.ok || body.code !== 'OK') {
    throw new ArticleApiError(body.message || '文章服务暂时不可用。', response.status)
  }
  return body.data
}

export function getPublishedArticles(params: ArticleListParams) {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.tag) search.set('tag', params.tag)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  return getPublicApi<PageResponse<Article>>('/articles', search)
}

export function getPublishedArticle(slug: string) {
  return getPublicApi<Article>(`/articles/${encodeURIComponent(slug)}`)
}

export function getPublishedTaxonomy() {
  return getPublicApi<Taxonomy>('/article-taxonomy')
}
