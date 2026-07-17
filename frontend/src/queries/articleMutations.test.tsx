import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useCreateArticleMutation,
  useDeleteArticleMutation,
  useLoginMutation,
  usePublishArticleMutation,
  useUnpublishArticleMutation,
  useUpdateArticleMutation,
  useUpdateCategoryMutation,
} from '@/queries/articleMutations'
import {
  adminArticlesQueryOptions,
  adminQueryKeys,
  articleQueryKeys,
} from '@/queries/articleQueries'
import {
  createArticle,
  deleteArticle,
  getAdminArticles,
  login,
  publishArticle,
  unpublishArticle,
  updateArticle,
  updateCategory,
  type Article,
} from '@/services/articles'
import { createTestQueryClient } from '@/test/renderWithQueryClient'

vi.mock('@/services/articles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/articles')>()
  return {
    ...actual,
    createArticle: vi.fn(),
    deleteArticle: vi.fn(),
    getAdminArticles: vi.fn(),
    login: vi.fn(),
    publishArticle: vi.fn(),
    unpublishArticle: vi.fn(),
    updateArticle: vi.fn(),
    updateCategory: vi.fn(),
  }
})

const article: Article = {
  id: 1,
  title: '组件边界',
  slug: 'component-boundaries',
  summary: '把页面复杂度限制在可维护的边界内。',
  content: '正文',
  coverImageUrl: null,
  status: 'DRAFT',
  publishedAt: null,
  createdAt: '2026-07-12T00:00:00',
  updatedAt: '2026-07-12T00:00:00',
  category: {
    id: 1,
    name: '前端',
    slug: 'frontend',
    sortOrder: 0,
    enabled: true,
    articleCount: 1,
  },
  tags: [],
}

const articlePayload = {
  title: article.title,
  slug: article.slug,
  summary: article.summary,
  content: article.content,
  categoryId: article.category.id,
  tagIds: [],
}

function createWrapper() {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return { queryClient, Wrapper }
}

describe('article mutations', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('发布、撤回和删除后重新获取活跃的后台文章列表', async () => {
    vi.mocked(getAdminArticles).mockResolvedValue({
      items: [article],
      total: 1,
      page: 1,
      pageSize: 50,
    })
    vi.mocked(publishArticle).mockResolvedValue({ ...article, status: 'PUBLISHED' })
    vi.mocked(unpublishArticle).mockResolvedValue(article)
    vi.mocked(deleteArticle).mockResolvedValue(null)
    const { Wrapper } = createWrapper()
    const listHook = renderHook(
      () => useQuery(adminArticlesQueryOptions({ page: 1, pageSize: 50 })),
      { wrapper: Wrapper },
    )
    const mutationHook = renderHook(
      () => ({
        publish: usePublishArticleMutation(),
        unpublish: useUnpublishArticleMutation(),
        remove: useDeleteArticleMutation(),
      }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(listHook.result.current.isSuccess).toBe(true))

    await act(() => mutationHook.result.current.publish.mutateAsync(article.id))
    expect(getAdminArticles).toHaveBeenCalledTimes(2)

    await act(() => mutationHook.result.current.unpublish.mutateAsync(article.id))
    expect(getAdminArticles).toHaveBeenCalledTimes(3)

    await act(() => mutationHook.result.current.remove.mutateAsync(article.id))
    expect(getAdminArticles).toHaveBeenCalledTimes(4)
  })

  it('创建和编辑文章后写入后台详情缓存', async () => {
    vi.mocked(createArticle).mockResolvedValue(article)
    vi.mocked(updateArticle).mockResolvedValue({ ...article, title: '更新后的标题' })
    const { queryClient, Wrapper } = createWrapper()
    const mutationHook = renderHook(
      () => ({
        create: useCreateArticleMutation(),
        update: useUpdateArticleMutation(),
      }),
      { wrapper: Wrapper },
    )

    await act(() => mutationHook.result.current.create.mutateAsync(articlePayload))
    expect(queryClient.getQueryData(adminQueryKeys.articleDetail('1'))).toEqual(article)

    await act(() =>
      mutationHook.result.current.update.mutateAsync({ id: '1', payload: articlePayload }),
    )
    expect(queryClient.getQueryData<Article>(adminQueryKeys.articleDetail('1'))?.title).toBe(
      '更新后的标题',
    )
  })

  it('taxonomy 变更后使公开文章和后台 taxonomy 缓存失效', async () => {
    vi.mocked(updateCategory).mockResolvedValue(article.category)
    const { queryClient, Wrapper } = createWrapper()
    queryClient.setQueryData(articleQueryKeys.taxonomy(), { categories: [], tags: [] })
    queryClient.setQueryData(adminQueryKeys.categories(), [article.category])
    const mutationHook = renderHook(() => useUpdateCategoryMutation(), { wrapper: Wrapper })

    await act(() =>
      mutationHook.result.current.mutateAsync({
        id: article.category.id,
        payload: {
          name: article.category.name,
          slug: article.category.slug,
          enabled: article.category.enabled,
          sortOrder: article.category.sortOrder || 0,
        },
      }),
    )

    expect(queryClient.getQueryState(articleQueryKeys.taxonomy())?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(adminQueryKeys.categories())?.isInvalidated).toBe(true)
  })

  it('登录成功后移除旧查询缓存', async () => {
    vi.mocked(login).mockResolvedValue({
      token: 'token',
      tokenType: 'Bearer',
      expiresInSeconds: 3600,
    })
    const { queryClient, Wrapper } = createWrapper()
    queryClient.setQueryData(adminQueryKeys.articleDetail('1'), article)
    const mutationHook = renderHook(() => useLoginMutation(), { wrapper: Wrapper })

    await act(() =>
      mutationHook.result.current.mutateAsync({ username: 'admin', password: 'password' }),
    )

    expect(queryClient.getQueryData(adminQueryKeys.articleDetail('1'))).toBeUndefined()
  })
})
