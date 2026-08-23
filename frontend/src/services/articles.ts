import { isAxiosError } from 'axios'
import request from '@/services/request'
import type {
  AdminArticleListParams,
  Article,
  ArticleCategory,
  ArticlePayload,
  ArticleTag,
  PageResponse,
  TaxonomyPayload,
} from '@/lib/articles/types'

export type {
  AdminArticleListParams,
  Article,
  ArticleCategory,
  ArticlePayload,
  ArticleTag,
  ChangePasswordPayload,
  PageResponse,
  TaxonomyPayload,
} from '@/lib/articles/types'

export type ApiResponse<T> = {
  code: string
  message: string
  data: T
}

function errorMessage(error: unknown) {
  if (isAxiosError<ApiResponse<null>>(error)) {
    return error.response?.data.message || '请求失败，请稍后重试。'
  }
  return error instanceof Error ? error.message : '请求失败，请稍后重试。'
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  try {
    const response = await promise
    if (response.data.code !== 'OK') {
      throw new Error(response.data.message)
    }
    return response.data.data
  } catch (error) {
    throw new Error(errorMessage(error))
  }
}

export function getAdminArticles(params: AdminArticleListParams, signal?: AbortSignal) {
  return unwrap(
    request.get<ApiResponse<PageResponse<Article>>>('/admin/articles', { params, signal }),
  )
}

export function getAdminArticle(id: string, signal?: AbortSignal) {
  return unwrap(request.get<ApiResponse<Article>>(`/admin/articles/${id}`, { signal }))
}

export function createArticle(payload: ArticlePayload) {
  return unwrap(request.post<ApiResponse<Article>>('/admin/articles', payload))
}

export function updateArticle(id: string, payload: ArticlePayload) {
  return unwrap(request.put<ApiResponse<Article>>(`/admin/articles/${id}`, payload))
}

export function publishArticle(id: number) {
  return unwrap(request.post<ApiResponse<Article>>(`/admin/articles/${id}/publish`))
}

export function unpublishArticle(id: number) {
  return unwrap(request.post<ApiResponse<Article>>(`/admin/articles/${id}/unpublish`))
}

export function deleteArticle(id: number) {
  return unwrap(request.delete<ApiResponse<null>>(`/admin/articles/${id}`))
}

export function getAdminCategories(signal?: AbortSignal) {
  return unwrap(
    request.get<ApiResponse<ArticleCategory[]>>('/admin/article-categories', { signal }),
  )
}

export function getAdminTags(signal?: AbortSignal) {
  return unwrap(request.get<ApiResponse<ArticleTag[]>>('/admin/article-tags', { signal }))
}

export function createCategory(payload: TaxonomyPayload) {
  return unwrap(request.post<ApiResponse<ArticleCategory>>('/admin/article-categories', payload))
}

export function updateCategory(id: number, payload: TaxonomyPayload) {
  return unwrap(
    request.put<ApiResponse<ArticleCategory>>(`/admin/article-categories/${id}`, payload),
  )
}

export function deleteCategory(id: number) {
  return unwrap(request.delete<ApiResponse<null>>(`/admin/article-categories/${id}`))
}

export function createTag(payload: TaxonomyPayload) {
  return unwrap(request.post<ApiResponse<ArticleTag>>('/admin/article-tags', payload))
}

export function updateTag(id: number, payload: TaxonomyPayload) {
  return unwrap(request.put<ApiResponse<ArticleTag>>(`/admin/article-tags/${id}`, payload))
}

export function deleteTag(id: number) {
  return unwrap(request.delete<ApiResponse<null>>(`/admin/article-tags/${id}`))
}

export function uploadMedia(file: File) {
  const body = new FormData()
  body.append('file', file)
  return unwrap(request.post<ApiResponse<{ url: string; fileName: string }>>('/admin/media', body))
}
