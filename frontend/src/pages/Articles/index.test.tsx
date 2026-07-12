import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import Articles from '@/pages/Articles'
import { getArticles, getTaxonomy } from '@/services/articles'

vi.mock('@/services/articles', () => ({
  getArticles: vi.fn(),
  getTaxonomy: vi.fn(),
}))

const mockGetArticles = vi.mocked(getArticles)
const mockGetTaxonomy = vi.mocked(getTaxonomy)

describe('Articles', () => {
  it('按分类更新公开文章请求', async () => {
    mockGetTaxonomy.mockResolvedValue({
      categories: [
        { id: 1, name: '前端', slug: 'frontend', sortOrder: 0, enabled: true, articleCount: 1 },
      ],
      tags: [],
    })
    mockGetArticles.mockResolvedValue({
      items: [
        {
          id: 1,
          title: '组件边界',
          slug: 'component-boundaries',
          summary: '把页面复杂度限制在可维护的边界内。',
          content: '',
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
        },
      ],
      total: 1,
      page: 1,
      pageSize: 12,
    })

    render(
      <MemoryRouter initialEntries={['/articles']}>
        <Routes>
          <Route path="/articles" element={<Articles />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: '组件边界' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /前端 1/ }))
    await waitFor(() =>
      expect(mockGetArticles).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'frontend' }),
      ),
    )
  })
})
