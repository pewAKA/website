import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import ArticleDetail from '@/pages/ArticleDetail'
import { getArticle } from '@/services/articles'

vi.mock('@/services/articles', () => ({
  getArticle: vi.fn(),
}))

describe('ArticleDetail', () => {
  it('渲染目录和 Markdown 代码块', async () => {
    vi.mocked(getArticle).mockResolvedValue({
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
    })

    render(
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
})
