import Link from 'next/link'
import { DocsPage } from 'fumadocs-ui/layouts/docs/page'
import {
  getCategoryHref,
  getDocumentCategory,
  getDocumentHref,
  getTagHref,
} from '@/lib/docs/repository'
import type { DocumentRecord } from '@/lib/docs/types'

type DocsCollectionProps = {
  kind: 'category' | 'tag'
  title: string
  description: string
  documents: DocumentRecord[]
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export default function DocsCollection({
  kind,
  title,
  description,
  documents,
}: DocsCollectionProps) {
  const latestUpdatedAt = documents[0]?.updatedAt

  return (
    <DocsPage
      className="docs-collection"
      full
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      <header className="docs-collection__header">
        <div>
          <Link className="docs-collection__back" href="/articles">
            ← 返回全部文档
          </Link>
          <p>{kind === 'category' ? 'Category index' : 'Tag index'}</p>
          <h1>{kind === 'tag' ? `#${title}` : title}</h1>
          <span>{description}</span>
        </div>
        <dl aria-label="聚合页概览">
          <div>
            <dt>Entries</dt>
            <dd>{String(documents.length).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{latestUpdatedAt ? formatShortDate(latestUpdatedAt) : '—'}</dd>
          </div>
        </dl>
      </header>

      <ol className="docs-collection__list">
        {documents.map((document, index) => {
          const category = getDocumentCategory(document.category)
          return (
            <li key={document.id}>
              <span className="docs-collection__index">{String(index + 1).padStart(2, '0')}</span>
              <article>
                <div className="docs-collection__meta">
                  <Link href={getCategoryHref(document.category)}>
                    {category?.name || document.category}
                  </Link>
                  <time dateTime={document.updatedAt}>{formatShortDate(document.updatedAt)}</time>
                  <span>{document.readingMinutes} min</span>
                </div>
                <h2>
                  <Link href={getDocumentHref(document)}>{document.title}</Link>
                </h2>
                <p>{document.description}</p>
                <nav className="docs-collection__tags" aria-label={`${document.title} 的标签`}>
                  {document.tags.map((tag) => (
                    <Link href={getTagHref(tag)} key={tag}>
                      #{tag}
                    </Link>
                  ))}
                </nav>
              </article>
              <Link
                className="docs-collection__open"
                href={getDocumentHref(document)}
                aria-label={`阅读《${document.title}》`}
              >
                ↗
              </Link>
            </li>
          )
        })}
      </ol>
    </DocsPage>
  )
}
