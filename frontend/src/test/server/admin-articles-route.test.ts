import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '@/app/api/admin/articles/route'
import { ApiError } from '@/server/http/errors'

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  listAdmin: vi.fn(),
  create: vi.fn(),
}))

vi.mock('@/server/auth/session', () => ({ requireAdmin: mocks.requireAdmin }))
vi.mock('@/server/services/article-service', () => ({
  articleService: { listAdmin: mocks.listAdmin, create: mocks.create },
}))

describe('/api/admin/articles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockResolvedValue({ user: { role: 'admin' } })
  })

  it('保持分页参数和统一响应结构', async () => {
    const page = { items: [], total: 0, page: 2, pageSize: 50 }
    mocks.listAdmin.mockResolvedValue(page)
    const response = await GET(new Request('http://localhost/api/admin/articles?status=DRAFT&page=2&pageSize=50'))

    expect(mocks.listAdmin).toHaveBeenCalledWith('DRAFT', 2, 50)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ code: 'OK', message: '操作成功', data: page })
  })

  it('拒绝超出上限的分页和未登录请求', async () => {
    const invalid = await GET(new Request('http://localhost/api/admin/articles?pageSize=51'))
    expect(invalid.status).toBe(400)
    await expect(invalid.json()).resolves.toMatchObject({ code: 'VALIDATION_ERROR', data: null })

    mocks.requireAdmin.mockRejectedValueOnce(new ApiError(401, 'UNAUTHORIZED', '请先登录'))
    const unauthorized = await GET(new Request('http://localhost/api/admin/articles'))
    expect(unauthorized.status).toBe(401)
  })

  it('创建草稿时校验 JSON 并返回兼容结构', async () => {
    const article = { id: 10, title: '草稿' }
    mocks.create.mockResolvedValue(article)
    const response = await POST(new Request('http://localhost/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '草稿', slug: 'draft', summary: '摘要', content: '# 正文', categoryId: 1, tagIds: [],
      }),
    }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ code: 'OK', data: article })
  })
})

