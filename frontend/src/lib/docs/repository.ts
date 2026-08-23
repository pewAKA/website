import { documentCategories, mockDocuments } from './mock-documents'
import type { DocumentCategory, DocumentRecord, DocumentRepository, DocumentTag } from './types'

function pathKey(slugs: string[]) {
  return slugs.join('/')
}

function normalizeTaxonomyValue(value: string) {
  return value.trim().toLocaleLowerCase('en-US')
}

export function sortByUpdatedAt(documents: DocumentRecord[]) {
  return documents.toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

/**
 * 当前公开文档只读取本地 Mock。未来接回后端时替换这个 Repository，
 * 页面、搜索和 Fumadocs 布局都继续依赖同一份 DocumentRecord 契约。
 */
export const mockDocumentRepository: DocumentRepository = {
  async list() {
    return [...mockDocuments]
  },
  async findBySlugs(slugs) {
    const key = pathKey(slugs)
    return mockDocuments.find((document) => pathKey(document.slugs) === key)
  },
  async listByCategory(category) {
    const normalizedCategory = normalizeTaxonomyValue(category)
    return sortByUpdatedAt(
      mockDocuments.filter(
        (document) => normalizeTaxonomyValue(document.category) === normalizedCategory,
      ),
    )
  },
  async listByTag(tag) {
    const normalizedTag = normalizeTaxonomyValue(tag)
    return sortByUpdatedAt(
      mockDocuments.filter((document) =>
        document.tags.some((item) => normalizeTaxonomyValue(item) === normalizedTag),
      ),
    )
  },
}

export function getDocumentHref(document: Pick<DocumentRecord, 'slugs'>) {
  return `/articles/${document.slugs.join('/')}`
}

export function getCategoryHref(categorySlug: string) {
  return `/articles/categories/${encodeURIComponent(categorySlug)}`
}

export function getTagSlug(tag: string) {
  return tag
    .normalize('NFKD')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getTagHref(tag: string) {
  return `/articles/tags/${encodeURIComponent(getTagSlug(tag))}`
}

export function getDocumentCategory(categorySlug: string) {
  return documentCategories.find((category) => category.slug === categorySlug)
}

/** 合并产品内置分类说明和数据库中的新分类，保证后台新建分类也能进入页面树。 */
export function createDocumentCategories(documents: DocumentRecord[]): DocumentCategory[] {
  const categories = new Map(documentCategories.map((category) => [category.slug, category]))

  for (const document of documents) {
    if (!categories.has(document.category)) {
      categories.set(document.category, {
        slug: document.category,
        name: document.categoryName || document.category,
        description: `收录 ${document.categoryName || document.category} 分类下的工程记录。`,
        order: categories.size + 1,
      })
    }
  }

  return [...categories.values()].toSorted((left, right) => left.order - right.order)
}

export function createDocumentTags(documents: DocumentRecord[]): DocumentTag[] {
  const tags = new Map<string, DocumentTag>()

  for (const document of documents) {
    for (const name of document.tags) {
      const slug = getTagSlug(name)
      const existing = tags.get(slug)
      tags.set(slug, { slug, name: existing?.name || name, count: (existing?.count || 0) + 1 })
    }
  }

  return [...tags.values()].toSorted(
    (left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-CN'),
  )
}

export async function getDocumentTags() {
  return createDocumentTags(await mockDocumentRepository.list())
}

export async function getDocumentTag(tagSlug: string) {
  return (await getDocumentTags()).find((tag) => tag.slug === tagSlug)
}

export async function getRecentDocuments(limit = 2) {
  const documents = await mockDocumentRepository.list()
  return sortByUpdatedAt(documents).slice(0, limit)
}
