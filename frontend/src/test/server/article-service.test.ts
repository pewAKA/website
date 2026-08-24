import { describe, expect, it, vi } from 'vitest'
import type { ArticleRepository } from '@/server/repositories/article-repository'
import { ArticleService } from '@/server/services/article-service'

vi.mock('server-only', () => ({}))
vi.mock('@/server/repositories/article-repository', () => ({
  mysqlArticleRepository: {},
}))

function createRepository(overrides: Partial<ArticleRepository> = {}) {
  return {
    findCategoryById: vi.fn().mockResolvedValue({ id: 1, enabled: true }),
    countTagsByIds: vi.fn().mockResolvedValue(2),
    findArticleById: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ArticleRepository
}

const input = {
  title: 'Server Component 数据边界',
  slug: 'server-component-data-boundary',
  summary: '校验服务层业务规则。',
  content: '# 正文',
  categoryId: 1,
  tagIds: [1, 2],
  documentMeta: { featured: false, readingMinutes: null },
}

describe('ArticleService', () => {
  it('无效 MDX 不会进入数据库', async () => {
    const createArticle = vi.fn()
    const repository = createRepository({ createArticle })
    await expect(
      new ArticleService(repository).create({ ...input, content: '<Tabs>' }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' })
    expect(createArticle).not.toHaveBeenCalled()
  })

  it('拒绝未启用分类', async () => {
    const repository = createRepository({
      findCategoryById: vi.fn().mockResolvedValue({ id: 1, enabled: false }),
    })
    await expect(new ArticleService(repository).create(input)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('拒绝不存在的标签', async () => {
    const repository = createRepository({ countTagsByIds: vi.fn().mockResolvedValue(1) })
    await expect(new ArticleService(repository).create(input)).rejects.toThrow('所选标签不存在')
  })

  it('将数据库唯一冲突转换为 409', async () => {
    const repository = createRepository({
      createArticle: vi.fn().mockRejectedValue({ code: 'ER_DUP_ENTRY' }),
    })
    await expect(new ArticleService(repository).create(input)).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
    })
  })

  it('被引用的分类不可删除', async () => {
    const repository = createRepository({ deleteCategoryIfUnused: vi.fn().mockResolvedValue(false) })
    await expect(new ArticleService(repository).deleteCategory(1)).rejects.toThrow('仍有关联文章')
  })
})
