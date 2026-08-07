import { afterEach, describe, expect, it, vi } from 'vitest'
import { ArticleApiError, getPublishedArticle } from '@/services/articles.server'

describe('公开文章详情服务', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('安全编码 slug 并返回文章', async () => {
    const article = { id: 1, slug: 'next article', title: '文章标题' }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'OK', message: '成功', data: article }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(getPublishedArticle('next article')).resolves.toEqual(article)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8081/api/articles/next%20article',
      { next: { revalidate: 60, tags: ['articles'] } },
    )
  })

  it('保留后端 404 状态供页面调用 notFound', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'NOT_FOUND', message: '文章不存在', data: null }), { status: 404 }),
    ))

    await expect(getPublishedArticle('missing')).rejects.toMatchObject({
      message: '文章不存在',
      status: 404,
    } satisfies Partial<ArticleApiError>)
  })

  it('拒绝无法解析的接口响应', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('invalid', { status: 502 })))
    await expect(getPublishedArticle('broken')).rejects.toThrow('无法识别的数据')
  })
})
