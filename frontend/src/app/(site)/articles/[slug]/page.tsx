import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from '@/components/CodeBlock'
import { ArticleApiError, getPublishedArticle } from '@/services/articles.server'
import '@/features/ArticleDetail/index.scss'

function headingId(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')
}

function getHeadings(content: string) {
  const occurrences = new Map<string, number>()
  return Array.from(content.matchAll(/^(#{2,3})\s+(.+)$/gm)).map((match) => {
    const text = match[2].replace(/[*_`]/g, '').trim()
    const baseId = headingId(text)
    const count = occurrences.get(baseId) || 0
    occurrences.set(baseId, count + 1)
    return { level: match[1].length as 2 | 3, text, id: count ? `${baseId}-${count + 1}` : baseId }
  })
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
    : ''
}

async function loadArticle(slug: string) {
  try {
    return await getPublishedArticle(slug)
  } catch (error) {
    if (error instanceof ArticleApiError && error.status === 404) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await loadArticle(slug)
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/articles/${article.slug}` },
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await loadArticle(slug)
  const headings = getHeadings(article.content)
  const headingLookup = new Map<string, string[]>()
  headings.forEach((item) => headingLookup.set(item.text, [...(headingLookup.get(item.text) || []), item.id]))
  const consumeHeadingId = (value: string) => headingLookup.get(value)?.shift() || headingId(value)

  return (
    <main className="article-detail">
      <header className="article-detail__header">
        <Link href="/articles">← 返回文章列表</Link>
        <p>{article.category.name} · {formatDate(article.publishedAt)}</p>
        <h1>{article.title}</h1>
        <div className="article-detail__tags">{article.tags.map((item) => <span key={item.id}>#{item.name}</span>)}</div>
        <p className="article-detail__summary">{article.summary}</p>
        {article.coverImageUrl && <img src={article.coverImageUrl} alt="" />}
      </header>
      <div className="article-detail__layout">
        {headings.length > 0 && (
          <aside className="article-detail__toc" aria-label="文章目录">
            <span>On this page</span>
            <ol>{headings.map((item) => <li className={item.level === 3 ? 'is-subheading' : ''} key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ol>
          </aside>
        )}
        <article className="article-detail__content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            components={{
              pre: ({ children }) => <>{children}</>,
              h2: ({ children }) => <h2 id={consumeHeadingId(String(children))}>{children}</h2>,
              h3: ({ children }) => <h3 id={consumeHeadingId(String(children))}>{children}</h3>,
              code: ({ className, children }) => {
                const code = String(children).replace(/\n$/, '')
                return className || code.includes('\n') ? <CodeBlock className={className} code={code} /> : <code>{children}</code>
              },
              a: ({ href, children, ...props }) => {
                const external = href?.startsWith('http')
                return <a href={href} rel={external ? 'noreferrer noopener' : undefined} target={external ? '_blank' : undefined} {...props}>{children}</a>
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  )
}
