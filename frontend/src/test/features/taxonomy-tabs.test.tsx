import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { App as AntApp } from 'antd'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DocsTaxonomy } from '@/features/DocsManager/Taxonomy'
import { renderWithQueryClient } from '@/test/renderWithQueryClient'

const fixtures = vi.hoisted(() => ({
  categories: [
    {
      articleCount: 2,
      enabled: true,
      id: 'category-1',
      name: '前端架构',
      slug: 'frontend',
      sortOrder: 0,
    },
  ],
  mutateAsync: vi.fn(),
  tags: [
    {
      articleCount: 1,
      id: 'tag-1',
      name: 'Next.js',
      slug: 'next-js',
    },
  ],
}))

vi.mock('@/queries/articleQueries', () => ({
  adminCategoriesQueryOptions: () => ({
    queryFn: async () => fixtures.categories,
    queryKey: ['admin', 'categories'],
  }),
  adminTagsQueryOptions: () => ({
    queryFn: async () => fixtures.tags,
    queryKey: ['admin', 'tags'],
  }),
}))

vi.mock('@/queries/articleMutations', () => ({
  useCreateCategoryMutation: () => ({ isPending: false, mutateAsync: fixtures.mutateAsync }),
  useCreateTagMutation: () => ({ isPending: false, mutateAsync: fixtures.mutateAsync }),
  useDeleteCategoryMutation: () => ({ isPending: false, mutateAsync: fixtures.mutateAsync }),
  useDeleteTagMutation: () => ({ isPending: false, mutateAsync: fixtures.mutateAsync }),
  useUpdateCategoryMutation: () => ({ isPending: false, mutateAsync: fixtures.mutateAsync }),
  useUpdateTagMutation: () => ({ isPending: false, mutateAsync: fixtures.mutateAsync }),
}))

describe('DocsTaxonomy tabs', () => {
  beforeEach(() => {
    fixtures.mutateAsync.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('支持点击和方向键切换分类与标签页面', async () => {
    renderWithQueryClient(
      <AntApp>
        <DocsTaxonomy />
      </AntApp>,
    )

    const categoryTab = await screen.findByRole('tab', { name: /分类管理/ })
    const tagTab = screen.getByRole('tab', { name: /标签管理/ })

    expect(categoryTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: /分类管理/ })).toBeVisible()
    expect(screen.queryByRole('tabpanel', { name: /标签管理/ })).not.toBeInTheDocument()

    fireEvent.click(tagTab)

    expect(tagTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: /标签管理/ })).toBeVisible()

    fireEvent.keyDown(tagTab, { key: 'ArrowLeft' })

    expect(categoryTab).toHaveAttribute('aria-selected', 'true')
    expect(categoryTab).toHaveFocus()
  })

  it('通过弹窗新建分类', async () => {
    renderWithQueryClient(
      <AntApp>
        <DocsTaxonomy />
      </AntApp>,
    )

    fireEvent.click(await screen.findByRole('button', { name: '新建分类' }))

    const categoryDialog = await screen.findByRole('dialog', { name: '新建分类' })
    fireEvent.change(within(categoryDialog).getByLabelText('名称'), {
      target: { value: '性能优化' },
    })
    fireEvent.change(within(categoryDialog).getByLabelText('Slug'), {
      target: { value: 'performance' },
    })
    fireEvent.click(within(categoryDialog).getByRole('button', { name: '创建分类' }))

    await waitFor(() => {
      expect(fixtures.mutateAsync).toHaveBeenCalledWith({
        enabled: true,
        name: '性能优化',
        slug: 'performance',
        sortOrder: 0,
      })
    })
  })

  it('通过弹窗新建标签', async () => {
    renderWithQueryClient(
      <AntApp>
        <DocsTaxonomy />
      </AntApp>,
    )

    fireEvent.click(await screen.findByRole('tab', { name: /标签管理/ }))
    fireEvent.click(screen.getByRole('button', { name: '新建标签' }))

    await waitFor(() => {
      const dialogTitle = screen.getByText('新建标签', { selector: '.ant-modal-title' })
      expect(dialogTitle.closest('[role="dialog"]')).not.toHaveStyle({ display: 'none' })
    })
  })
})
