import { describe, expect, it, vi } from 'vitest'
import sitemap from '@/app/sitemap'
import { mockDocumentRepository } from '@/lib/docs/repository'

describe('sitemap', () => {
  it('仅由固定路由和 Mock 文档构建，不请求后端文章接口', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const documents = await mockDocumentRepository.list()
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain('http://localhost:3000/articles')
    for (const document of documents) {
      expect(urls).toContain(`http://localhost:3000/articles/${document.slugs.join('/')}`)
    }
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})

