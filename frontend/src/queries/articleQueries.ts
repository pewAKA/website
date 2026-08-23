import { queryOptions } from '@tanstack/react-query'
import {
  getAdminArticle,
  getAdminArticles,
  getAdminCategories,
  getAdminTags,
  type AdminArticleListParams,
} from '@/services/articles'

export const adminQueryKeys = {
  all: ['admin'] as const,
  articles: () => [...adminQueryKeys.all, 'articles'] as const,
  articleLists: () => [...adminQueryKeys.articles(), 'list'] as const,
  articleList: (params: AdminArticleListParams) =>
    [...adminQueryKeys.articleLists(), params] as const,
  articleDetails: () => [...adminQueryKeys.articles(), 'detail'] as const,
  articleDetail: (id: string) => [...adminQueryKeys.articleDetails(), id] as const,
  categories: () => [...adminQueryKeys.all, 'article-categories'] as const,
  tags: () => [...adminQueryKeys.all, 'article-tags'] as const,
}

export function adminArticlesQueryOptions(params: AdminArticleListParams) {
  return queryOptions({
    queryKey: adminQueryKeys.articleList(params),
    queryFn: ({ signal }) => getAdminArticles(params, signal),
    refetchOnWindowFocus: true,
    staleTime: 0,
  })
}

export function adminArticleQueryOptions(id: string) {
  return queryOptions({
    queryKey: adminQueryKeys.articleDetail(id),
    queryFn: ({ signal }) => getAdminArticle(id, signal),
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}

export function adminCategoriesQueryOptions() {
  return queryOptions({
    queryKey: adminQueryKeys.categories(),
    queryFn: ({ signal }) => getAdminCategories(signal),
    refetchOnWindowFocus: true,
    staleTime: 0,
  })
}

export function adminTagsQueryOptions() {
  return queryOptions({
    queryKey: adminQueryKeys.tags(),
    queryFn: ({ signal }) => getAdminTags(signal),
    refetchOnWindowFocus: true,
    staleTime: 0,
  })
}
