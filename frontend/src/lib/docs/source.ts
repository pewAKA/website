import { structure } from 'fumadocs-core/mdx-plugins'
import type { DynamicSource, VirtualFile } from 'fumadocs-core/source'
import { dynamicLoader } from 'fumadocs-core/source/dynamic'
import { portalDocument } from './mock-documents'
import { createDocumentCategories } from './repository'
import type { DocumentMetaData, DocumentPageData, DocumentRepository } from './types'
import { databaseDocumentRepository } from '@/server/repositories/document-repository'

type DocsSourceConfig = {
  pageData: DocumentPageData
  metaData: DocumentMetaData
}

function createDocumentSource(repository: DocumentRepository): DynamicSource<DocsSourceConfig> {
  return {
    cache: 'memory',
    staleTime: 30_000,
    async files() {
      const documents = await repository.list()
      const categories = createDocumentCategories(documents)
      // 将 Repository 记录适配为 Fumadocs 虚拟文件；页面不感知真实数据源的实现。
      const files: VirtualFile<DocsSourceConfig>[] = [
        {
          type: 'page',
          path: 'index.mdx',
          slugs: [],
          data: {
            ...portalDocument,
            structuredData: structure(portalDocument.content),
          },
        },
        {
          type: 'meta',
          path: 'meta.json',
          data: {
            title: '工程笔记',
            description: portalDocument.description,
            pages: ['index', ...categories.map((category) => category.slug)],
          },
        },
      ]

      for (const category of categories) {
        const categoryDocuments = documents.filter(
          (document) => document.category === category.slug,
        )
        files.push({
          type: 'meta',
          path: `${category.slug}/meta.json`,
          data: {
            title: category.name,
            description: category.description,
            defaultOpen: true,
            pages: categoryDocuments.map((document) => document.slugs.at(-1) || document.id),
          },
        })

        for (const document of categoryDocuments) {
          files.push({
            type: 'page',
            path: `${document.slugs.join('/')}.mdx`,
            slugs: document.slugs,
            data: {
              ...document,
              structuredData: structure(document.content),
            },
          })
        }
      }

      return files
    },
  }
}

const documentLoader = dynamicLoader(createDocumentSource(databaseDocumentRepository), {
  baseUrl: '/articles',
})

export function getDocsSource() {
  return documentLoader.get()
}

/** 测试可注入内存 Repository，不需要连接真实数据库。 */
export function getDocsSourceForRepository(repository: DocumentRepository) {
  return dynamicLoader(createDocumentSource(repository), { baseUrl: '/articles' }).get()
}
