import { z } from 'zod'

const slug = z
  .string()
  .trim()
  .min(1, '请输入 slug')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 只能包含小写字母、数字和连字符')

export const articleUpsertSchema = z
  .object({
    title: z.string().trim().min(1, '请输入文章标题').max(160, '标题不能超过 160 个字符'),
    slug: slug.max(180, '文章 slug 不能超过 180 个字符'),
    summary: z.string().trim().min(1, '请输入文章摘要').max(360, '摘要不能超过 360 个字符'),
    content: z.string().min(1, '请输入文章正文'),
    coverImageUrl: z.string().trim().max(500, '封面地址不能超过 500 个字符').optional(),
    categoryId: z.number().int().positive('请选择一个有效分类'),
    tagIds: z.array(z.number().int().positive('标签 ID 不合法')).max(100).default([]),
  })
  .superRefine((value, context) => {
    if (new Set(value.tagIds).size !== value.tagIds.length) {
      context.addIssue({ code: 'custom', path: ['tagIds'], message: '标签列表包含重复项' })
    }
  })

export const taxonomyUpsertSchema = z.object({
  name: z.string().trim().min(1, '请输入名称').max(64, '名称不能超过 64 个字符'),
  slug: slug.max(80, 'slug 不能超过 80 个字符'),
  sortOrder: z.number().int().min(0, '排序不能小于 0').optional().default(0),
  enabled: z.boolean().optional().default(true),
})

export const adminArticleListSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED'], { error: '文章状态只能为 DRAFT 或 PUBLISHED' }).optional(),
  page: z.coerce.number().int().min(1, '页码必须大于 0').default(1),
  pageSize: z.coerce.number().int().min(1).max(50, '每页数量不能超过 50').default(20),
})

export const positiveIdSchema = z.coerce.number().int().positive('资源 ID 不合法')

export type ArticleUpsertInput = z.infer<typeof articleUpsertSchema>
export type TaxonomyUpsertInput = z.infer<typeof taxonomyUpsertSchema>
