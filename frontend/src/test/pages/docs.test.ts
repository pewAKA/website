import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCompiler } from '@fumadocs/mdx-remote'
import { searchServer } from '@/app/api/search/route'
import { documentCategories, mockDocuments } from '@/lib/docs/mock-documents'
import {
  createDocumentTags,
  getCategoryHref,
  getDocumentHref,
  getDocumentTag,
  getRecentDocuments,
  getTagHref,
  mockDocumentRepository,
} from '@/lib/docs/repository'
import { getDocsSource } from '@/lib/docs/source'

describe('Mock 文档数据层', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('提供六篇文档、三个分类和唯一 slug', async () => {
    const documents = await mockDocumentRepository.list()
    const paths = documents.map((document) => document.slugs.join('/'))

    expect(documents).toHaveLength(6)
    expect(documentCategories).toHaveLength(3)
    expect(new Set(paths).size).toBe(paths.length)
    expect(documents.every((document) => document.content.length > 600)).toBe(true)
  })

  it('按路径查找文档并处理缺失记录', async () => {
    await expect(
      mockDocumentRepository.findBySlugs(['graphics', 'particle-frame-budget']),
    ).resolves.toMatchObject({ title: '把 26,000 个粒子留在一帧里' })
    await expect(mockDocumentRepository.findBySlugs(['missing'])).resolves.toBeUndefined()
  })

  it('最近文档排序不调用后端 fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const recent = await getRecentDocuments(2)

    expect(recent.map((document) => document.id)).toEqual([
      'server-component-boundaries',
      'particle-frame-budget',
    ])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('按分类和标签聚合文档，并保持更新时间倒序', async () => {
    await expect(mockDocumentRepository.listByCategory('frontend')).resolves.toHaveLength(2)
    await expect(mockDocumentRepository.listByTag('next.JS')).resolves.toMatchObject([
      { id: 'server-component-boundaries' },
      { id: 'testing-next-routes' },
    ])
    await expect(mockDocumentRepository.listByTag('missing')).resolves.toEqual([])
  })

  it('生成唯一、稳定且带计数的标签索引', async () => {
    const tags = createDocumentTags(mockDocuments)
    const nextTag = await getDocumentTag('next-js')

    expect(new Set(tags.map((tag) => tag.slug)).size).toBe(tags.length)
    expect(nextTag).toEqual({ slug: 'next-js', name: 'Next.js', count: 2 })
    expect(getTagHref('State machine')).toBe('/articles/tags/state-machine')
    expect(getCategoryHref('graphics')).toBe('/articles/categories/graphics')
  })
})

describe('Fumadocs 文档源', () => {
  it('生成门户、分类页面树和稳定 URL', async () => {
    const source = await getDocsSource()

    expect(source.getPages()).toHaveLength(mockDocuments.length + 1)
    expect(source.getPage([])?.url).toBe('/articles')
    expect(source.getPage(['frontend', 'server-component-boundaries'])?.url).toBe(
      '/articles/frontend/server-component-boundaries',
    )
    expect(source.getPage(['missing'])).toBeUndefined()
  })

  it('编译包含 Tabs、Callout 和代码块的可信 MDX', async () => {
    const compiler = createCompiler()
    const document = mockDocuments[0]
    const compiled = await compiler.compile({ source: document.content })

    expect(compiled.toc.length).toBeGreaterThanOrEqual(4)
    expect(compiled.body).toBeTypeOf('function')
  })

  it('用中文正文建立搜索索引', async () => {
    const results = await searchServer.search('粒子')

    expect(results.some((result) => result.url === getDocumentHref(mockDocuments[2]))).toBe(true)
  })
})
