import 'server-only'
import type { Article } from '@/lib/articles/types'
import { ApiError, isDuplicateEntry } from '@/server/http/errors'
import { validateTrustedMdx } from '@/server/docs/validate-mdx'
import {
  mysqlArticleRepository,
  type ArticleRepository,
} from '@/server/repositories/article-repository'
import type {
  ArticleUpsertInput,
  TaxonomyUpsertInput,
} from '@/server/validation/articles'

export class ArticleService {
  constructor(private readonly repository: ArticleRepository) {}

  listAdmin(status: Article['status'] | undefined, page: number, pageSize: number) {
    return this.repository.listAdmin(status, page, pageSize)
  }

  async getAdmin(id: number) {
    const article = await this.repository.findArticleById(id)
    if (!article) throw new ApiError(404, 'NOT_FOUND', '文章不存在')
    return article
  }

  async create(input: ArticleUpsertInput) {
    await validateTrustedMdx(input.content)
    await this.validateTaxonomy(input)
    try {
      const id = await this.repository.createArticle(input)
      return await this.getAdmin(id)
    } catch (error) {
      if (isDuplicateEntry(error)) throw new ApiError(409, 'CONFLICT', '文章 slug 已存在，请换一个地址标识')
      throw error
    }
  }

  async update(id: number, input: ArticleUpsertInput) {
    await this.getAdmin(id)
    await validateTrustedMdx(input.content)
    await this.validateTaxonomy(input)
    try {
      await this.repository.updateArticle(id, input)
      return await this.getAdmin(id)
    } catch (error) {
      if (isDuplicateEntry(error)) throw new ApiError(409, 'CONFLICT', '文章 slug 已存在，请换一个地址标识')
      throw error
    }
  }

  async publish(id: number) {
    const article = await this.getAdmin(id)
    await validateTrustedMdx(article.content)
    await this.repository.publishArticle(id)
    return this.getAdmin(id)
  }

  async unpublish(id: number) {
    await this.getAdmin(id)
    await this.repository.unpublishArticle(id)
    return this.getAdmin(id)
  }

  async deleteArticle(id: number) {
    await this.getAdmin(id)
    await this.repository.deleteArticle(id)
  }

  listCategories() {
    return this.repository.listCategories()
  }

  async createCategory(input: TaxonomyUpsertInput) {
    try {
      const id = await this.repository.createCategory(input)
      const category = await this.repository.findCategoryById(id)
      if (!category) throw new ApiError(500, 'INTERNAL_ERROR', '分类创建后无法读取')
      return category
    } catch (error) {
      if (isDuplicateEntry(error)) throw new ApiError(409, 'CONFLICT', '分类名称或 slug 已存在')
      throw error
    }
  }

  async updateCategory(id: number, input: TaxonomyUpsertInput) {
    if (!(await this.repository.findCategoryById(id))) throw new ApiError(404, 'NOT_FOUND', '分类不存在')
    try {
      await this.repository.updateCategory(id, input)
      return (await this.repository.findCategoryById(id))!
    } catch (error) {
      if (isDuplicateEntry(error)) throw new ApiError(409, 'CONFLICT', '分类名称或 slug 已存在')
      throw error
    }
  }

  async deleteCategory(id: number) {
    if (!(await this.repository.deleteCategoryIfUnused(id))) {
      throw new ApiError(400, 'VALIDATION_ERROR', '分类不存在，或仍有关联文章，无法删除')
    }
  }

  listTags() {
    return this.repository.listTags()
  }

  async createTag(input: TaxonomyUpsertInput) {
    try {
      const id = await this.repository.createTag(input)
      const tag = await this.repository.findTagById(id)
      if (!tag) throw new ApiError(500, 'INTERNAL_ERROR', '标签创建后无法读取')
      return tag
    } catch (error) {
      if (isDuplicateEntry(error)) throw new ApiError(409, 'CONFLICT', '标签名称或 slug 已存在')
      throw error
    }
  }

  async updateTag(id: number, input: TaxonomyUpsertInput) {
    if (!(await this.repository.findTagById(id))) throw new ApiError(404, 'NOT_FOUND', '标签不存在')
    try {
      await this.repository.updateTag(id, input)
      return (await this.repository.findTagById(id))!
    } catch (error) {
      if (isDuplicateEntry(error)) throw new ApiError(409, 'CONFLICT', '标签名称或 slug 已存在')
      throw error
    }
  }

  async deleteTag(id: number) {
    if (!(await this.repository.deleteTagIfUnused(id))) {
      throw new ApiError(400, 'VALIDATION_ERROR', '标签不存在，或仍有关联文章，无法删除')
    }
  }

  private async validateTaxonomy(input: ArticleUpsertInput) {
    const category = await this.repository.findCategoryById(input.categoryId)
    if (!category?.enabled) throw new ApiError(400, 'VALIDATION_ERROR', '请选择一个启用中的分类')
    if ((await this.repository.countTagsByIds(input.tagIds)) !== input.tagIds.length) {
      throw new ApiError(400, 'VALIDATION_ERROR', '所选标签不存在')
    }
  }
}

export const articleService = new ArticleService(mysqlArticleRepository)
