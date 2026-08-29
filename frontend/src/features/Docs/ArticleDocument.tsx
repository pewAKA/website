import { createCompiler } from '@fumadocs/mdx-remote'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/docs/page'
import Link from 'next/link'
import { getDocsMdxComponents } from '@/components/DocsMdx'
import { getCategoryHref, getDocumentCategory, getTagHref } from '@/lib/docs/repository'
import type { DocumentRecord } from '@/lib/docs/types'

const compiler = createCompiler()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export async function ArticleDocument({
  document,
  preview = false,
}: {
  document: DocumentRecord
  preview?: boolean
}) {
  /* 预览和公开页共用可信 MDX 编译链，确保后台看到的结果就是最终结果。 */
  const { body: MdxContent, toc } = await compiler.compile({
    source: document.content,
    filePath: `${document.slugs.join('/') || document.id}.mdx`,
  })
  const categoryName =
    document.categoryName || getDocumentCategory(document.category)?.name || document.category

  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      className="docs-article"
      tableOfContent={{ container: { className: 'docs-article__toc' } }}
      toc={toc}
    >
      {preview && (
        <div className="docs-preview-banner" role="status">
          <div>
            <strong>草稿精准预览</strong>
            <span>当前页面读取最近一次数据库保存，不包含尚未保存的编辑器内容。</span>
          </div>
          <Link href={`/articles/manage/${document.id}`}>返回编辑器</Link>
        </div>
      )}
      <div className="docs-article__eyebrow">
        <Link href={getCategoryHref(document.category)}>{categoryName}</Link>
        <span>{formatDate(document.publishedAt)}</span>
        <span>{document.readingMinutes} 分钟阅读</span>
      </div>
      <DocsTitle>{document.title}</DocsTitle>
      <DocsDescription>{document.description}</DocsDescription>
      <div className="docs-article__tags" aria-label="文章标签">
        {document.tags.map((tag) => (
          <Link href={getTagHref(tag)} key={tag}>
            #{tag}
          </Link>
        ))}
      </div>
      <DocsBody className="docs-article__body">
        <MdxContent components={getDocsMdxComponents()} />
      </DocsBody>
      <PageLastUpdate className="docs-article__updated" date={new Date(document.updatedAt)} />
    </DocsPage>
  )
}
