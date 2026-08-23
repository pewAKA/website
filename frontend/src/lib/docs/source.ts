import { structure } from 'fumadocs-core/mdx-plugins'
import type { DynamicSource, VirtualFile } from 'fumadocs-core/source'
import { dynamicLoader } from 'fumadocs-core/source/dynamic'
import { documentCategories, portalDocument } from './mock-documents'
import { mockDocumentRepository } from './repository'
import type { DocumentMetaData, DocumentPageData } from './types'

type DocsSourceConfig = {
  pageData: DocumentPageData
  metaData: DocumentMetaData
}

function createDocumentSource(): DynamicSource<DocsSourceConfig> {
  return {
    cache: 'memory',
    async files() {
      const documents = await mockDocumentRepository.list()
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
            pages: ['index', ...documentCategories.map((category) => category.slug)],
          },
        },
      ]

      for (const category of documentCategories.toSorted((a, b) => a.order - b.order)) {
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

const documentLoader = dynamicLoader(createDocumentSource(), {
  baseUrl: '/articles',
})

export function getDocsSource() {
  return documentLoader.get()
}
