import { describe, expect, it, vi } from 'vitest'
import { createSitemap } from '@/app/sitemap'
import { mockDocumentRepository } from '@/lib/docs/repository'

vi.mock('server-only', () => ({}))

describe('sitemap', () => {
  it('由固定路由和注入的文档仓库构建，不请求 HTTP 接口', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const documents = await mockDocumentRepository.list()
    const entries = await createSitemap(mockDocumentRepository)
    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain('http://localhost:3000/articles')
    for (const document of documents) {
      expect(urls).toContain(`http://localhost:3000/articles/${document.slugs.join('/')}`)
    }
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
