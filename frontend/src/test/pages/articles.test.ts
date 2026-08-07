import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPublishedArticles, getPublishedTaxonomy } from '@/services/articles.server'

function okResponse(data: unknown) {
  return new Response(JSON.stringify({ code: 'OK', message: '成功', data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('公开文章服务', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('传递筛选参数并使用 60 秒缓存', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ items: [], total: 0, page: 2, pageSize: 12 }))
    vi.stubGlobal('fetch', fetchMock)

    await getPublishedArticles({ category: 'frontend', tag: 'react', page: 2, pageSize: 12 })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8081/api/articles?category=frontend&tag=react&page=2&pageSize=12',
      { next: { revalidate: 60, tags: ['articles'] } },
    )
  })

  it('读取公开分类与标签', async () => {
    const taxonomy = { categories: [], tags: [] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(taxonomy)))

    await expect(getPublishedTaxonomy()).resolves.toEqual(taxonomy)
  })
})
