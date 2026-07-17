import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ArticleDetail from '@/pages/ArticleDetail'
import { getArticle, type Article } from '@/services/articles'
import { renderWithQueryClient } from '@/test/renderWithQueryClient'

vi.mock('@/services/articles', () => ({
  getArticle: vi.fn(),
}))

const article: Article = {
  id: 1,
  title: '文章标题',
  slug: 'article-title',
  summary: '文章摘要',
  content: '## 开始\n\n```ts\nconst answer = 42\n```',
  coverImageUrl: null,
  status: 'PUBLISHED',
  publishedAt: '2026-07-12T00:00:00',
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

describe('ArticleDetail', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('渲染目录和 Markdown 代码块', async () => {
    vi.mocked(getArticle).mockResolvedValue(article)

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/articles/article-title']}>
        <Routes>
          <Route path="/articles/:slug" element={<ArticleDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: '文章标题' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '开始' })).toHaveAttribute('href', '#开始')
    expect(screen.getByRole('button', { name: '复制代码' })).toBeInTheDocument()
    expect(screen.getByText('const answer = 42')).toBeInTheDocument()
  })

  it('slug 变化后请求并展示新的文章', async () => {
    vi.mocked(getArticle).mockImplementation(async (slug) => ({
      ...article,
      id: slug === 'next-article' ? 2 : 1,
      slug,
      title: slug === 'next-article' ? '下一篇文章' : article.title,
    }))

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/articles/article-title']}>
        <Link to="/articles/next-article">打开下一篇</Link>
        <Routes>
          <Route path="/articles/:slug" element={<ArticleDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: '文章标题' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: '打开下一篇' }))

    expect(await screen.findByRole('heading', { name: '下一篇文章' })).toBeInTheDocument()
    await waitFor(() =>
      expect(getArticle).toHaveBeenLastCalledWith('next-article', expect.any(AbortSignal)),
    )
  })

  it('展示文章请求错误并提供返回入口', async () => {
    vi.mocked(getArticle).mockRejectedValue(new Error('文章加载失败'))

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/articles/missing']}>
        <Routes>
          <Route path="/articles/:slug" element={<ArticleDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('文章加载失败')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '返回文章列表' })).toHaveAttribute('href', '/articles')
  })
})
