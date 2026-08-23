import { describe, expect, it } from 'vitest'
import {
  adminArticleListSchema,
  articleUpsertSchema,
  positiveIdSchema,
} from '@/server/validation/articles'

const validArticle = {
  title: '类型安全的内容契约',
  slug: 'type-safe-content-contract',
  summary: '用于验证后台输入边界。',
  content: '# 正文',
  categoryId: 1,
  tagIds: [1, 2],
}

describe('后台文章请求校验', () => {
  it('拒绝非法 slug 和重复标签', () => {
    expect(articleUpsertSchema.safeParse({ ...validArticle, slug: 'Invalid Slug' }).success).toBe(false)
    const result = articleUpsertSchema.safeParse({ ...validArticle, tagIds: [1, 1] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('标签列表包含重复项')
  })

  it('分页从 1 开始且每页最多 50 条', () => {
    expect(adminArticleListSchema.parse({ page: '1', pageSize: '50' })).toEqual({
      page: 1,
      pageSize: 50,
    })
    expect(adminArticleListSchema.safeParse({ page: 0 }).success).toBe(false)
    expect(adminArticleListSchema.safeParse({ pageSize: 51 }).success).toBe(false)
  })

  it('只接受正整数资源 ID', () => {
    expect(positiveIdSchema.parse('12')).toBe(12)
    expect(positiveIdSchema.safeParse('-1').success).toBe(false)
  })
})

