import Image from 'next/image'
import Link from 'next/link'
import { DocsPage } from 'fumadocs-ui/layouts/docs/page'
import { documentCategories } from '@/lib/docs/mock-documents'
import {
  createDocumentTags,
  getCategoryHref,
  getDocumentCategory,
  getDocumentHref,
  getTagHref,
} from '@/lib/docs/repository'
import type { DocumentRecord } from '@/lib/docs/types'
import './index.scss'

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export default function DocsPortal({ documents }: { documents: DocumentRecord[] }) {
  const recent = documents.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
  const tags = createDocumentTags(documents)
  const lead = recent[0]

  return (
    <DocsPage
      className="docs-portal"
      full
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      <header className="docs-portal__hero">
        <div className="docs-portal__intro">
          <p>Engineering field notes / 2026</p>
          <h1>把实现过程，整理成下一次能直接找到的答案。</h1>
          <span>
            这里记录 Next.js、实时图形和交互工程中的具体取舍。内容来自可替换的 Mock
            数据层，用于验证未来文档系统的完整形态。
          </span>
        </div>
        <dl className="docs-portal__ledger" aria-label="文档概览">
          <div>
            <dt>Notes</dt>
            <dd>{String(documents.length).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt>Tracks</dt>
            <dd>{String(documentCategories.length).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatShortDate(recent[0]?.updatedAt || new Date().toISOString())}</dd>
          </div>
        </dl>
      </header>

      {lead && (
        <section className="docs-portal__latest" aria-labelledby="latest-notes-title">
          <header>
            <div>
              <span>Recent updates</span>
              <h2 id="latest-notes-title">最近校正的记录</h2>
            </div>
            <p>不是按教程顺序排列，而是从最近真正遇到的问题开始。</p>
          </header>

          <div className="docs-portal__recent-grid">
            <Link className="docs-feature" href={getDocumentHref(lead)}>
              {lead.coverImage && (
                <div className="docs-feature__media">
                  <Image
                    src={lead.coverImage}
                    alt={`${lead.title} 的实验画面`}
                    fill
                    sizes="(max-width: 767px) 100vw, 62vw"
                  />
                </div>
              )}
              <div className="docs-feature__content">
                <div>
                  <span>{getDocumentCategory(lead.category)?.name}</span>
                  <time dateTime={lead.updatedAt}>更新于 {formatShortDate(lead.updatedAt)}</time>
                </div>
                <h3>{lead.title}</h3>
                <p>{lead.description}</p>
                <strong>阅读约 {lead.readingMinutes} 分钟 ↗</strong>
              </div>
            </Link>

            <ol className="docs-portal__recent-list">
              {recent.slice(1).map((document, index) => (
                <li key={document.id}>
                  <Link href={getDocumentHref(document)}>
                    <span>{String(index + 2).padStart(2, '0')}</span>
                    <div>
                      <small>{getDocumentCategory(document.category)?.name}</small>
                      <h3>{document.title}</h3>
                      <p>{document.description}</p>
                    </div>
                    <time dateTime={document.updatedAt}>{formatShortDate(document.updatedAt)}</time>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="docs-portal__tracks" aria-labelledby="tracks-title">
        <header>
          <span>Browse by track</span>
          <h2 id="tracks-title">按问题域浏览</h2>
        </header>
        <ol>
          {documentCategories.map((category, categoryIndex) => {
            const categoryDocuments = documents.filter(
              (document) => document.category === category.slug,
            )
            return (
              <li key={category.slug}>
                <div className="docs-track__heading">
                  <span>{String(categoryIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>
                      <Link href={getCategoryHref(category.slug)}>{category.name}</Link>
                    </h3>
                    <p>{category.description}</p>
                    <Link className="docs-track__all" href={getCategoryHref(category.slug)}>
                      查看该分类的 {categoryDocuments.length} 篇记录 ↗
                    </Link>
                  </div>
                </div>
                <div className="docs-track__links">
                  {categoryDocuments.map((document) => (
                    <Link href={getDocumentHref(document)} key={document.id}>
                      <span>{document.title}</span>
                      <small>{document.readingMinutes} min</small>
                    </Link>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="docs-portal__tags" aria-labelledby="tags-title">
        <header>
          <span>Cross references</span>
          <div>
            <h2 id="tags-title">沿着标签继续找</h2>
            <p>标签跨越分类，把同一个技术问题在不同场景中的处理方式连接起来。</p>
          </div>
        </header>
        <nav aria-label="文档标签索引">
          {tags.map((tag) => (
            <Link href={getTagHref(tag.name)} key={tag.slug}>
              <span>#{tag.name}</span>
              <small>{String(tag.count).padStart(2, '0')}</small>
            </Link>
          ))}
        </nav>
      </section>

      <footer className="docs-portal__footer">
        <span>Mock dataset · 2026.08</span>
        <p>当前内容用于验证信息架构、阅读密度与搜索体验，后续可直接替换为后台数据源。</p>
      </footer>
    </DocsPage>
  )
}
