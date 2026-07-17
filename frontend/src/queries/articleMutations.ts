import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  changePassword,
  createArticle,
  createCategory,
  createTag,
  deleteArticle,
  deleteCategory,
  deleteTag,
  login,
  publishArticle,
  unpublishArticle,
  updateArticle,
  updateCategory,
  updateTag,
  uploadMedia,
  type ArticlePayload,
  type ChangePasswordPayload,
  type TaxonomyPayload,
} from '@/services/articles'
import { adminQueryKeys, articleQueryKeys } from '@/queries/articleQueries'

async function invalidateArticleCollections(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: articleQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.articleLists() }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories() }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags() }),
  ])
}

async function invalidateTaxonomyCollections(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: articleQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.articles() }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories() }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags() }),
  ])
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    gcTime: 0,
    onSuccess: () => {
      // 新会话开始前移除上一位管理员可能留下的查询数据。
      queryClient.removeQueries()
    },
  })
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: () => {
      queryClient.removeQueries()
    },
  })
}

export function useCreateArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ArticlePayload) => createArticle(payload),
    onSuccess: async (article) => {
      queryClient.setQueryData(adminQueryKeys.articleDetail(String(article.id)), article)
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.articleLists() })
    },
  })
}

export function useUpdateArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ArticlePayload }) =>
      updateArticle(id, payload),
    onSuccess: async (article) => {
      queryClient.setQueryData(adminQueryKeys.articleDetail(String(article.id)), article)
      await invalidateArticleCollections(queryClient)
    },
  })
}

export function usePublishArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => publishArticle(id),
    onSuccess: async (article) => {
      queryClient.setQueryData(adminQueryKeys.articleDetail(String(article.id)), article)
      await invalidateArticleCollections(queryClient)
    },
  })
}

export function useUnpublishArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => unpublishArticle(id),
    onSuccess: async (article) => {
      queryClient.setQueryData(adminQueryKeys.articleDetail(String(article.id)), article)
      await invalidateArticleCollections(queryClient)
    },
  })
}

export function useDeleteArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteArticle(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: adminQueryKeys.articleDetail(String(id)) })
      await invalidateArticleCollections(queryClient)
    },
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaxonomyPayload) => createCategory(payload),
    onSuccess: () => invalidateTaxonomyCollections(queryClient),
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaxonomyPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => invalidateTaxonomyCollections(queryClient),
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => invalidateTaxonomyCollections(queryClient),
  })
}

export function useCreateTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaxonomyPayload) => createTag(payload),
    onSuccess: () => invalidateTaxonomyCollections(queryClient),
  })
}

export function useUpdateTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaxonomyPayload }) =>
      updateTag(id, payload),
    onSuccess: () => invalidateTaxonomyCollections(queryClient),
  })
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => invalidateTaxonomyCollections(queryClient),
  })
}

export function useUploadMediaMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadMedia(file),
  })
}
