import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router'
import CodeBlock from '@/components/CodeBlock'
import { getArticle, type Article } from '@/services/articles'
import { useDocumentMetadata } from '@/utils/seo'
import './index.scss'

function headingId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '')
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
    ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(value),
      )
    : ''
}

function ArticleDetail() {
  const { slug = '' } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const headings = useMemo(() => getHeadings(article?.content || ''), [article?.content])

  useDocumentMetadata({
    title: article ? `${article.title} · Lynco Hub` : '技术文章 · Lynco Hub',
    description: article?.summary || 'Lynco Hub 的技术文章。',
    canonicalPath: `/articles/${slug}`,
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void getArticle(slug)
      .then((result) => {
        if (!cancelled) {
          setArticle(result)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '文章暂时无法加载。')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return <main className="article-detail article-detail--state">正在打开文章…</main>
  }

  if (error || !article) {
    return (
      <main className="article-detail article-detail--state">
        <p>{error || '文章不存在。'}</p>
        <Link to="/articles">返回文章列表</Link>
      </main>
    )
  }

  const headingLookup = new Map<string, string[]>()
  headings.forEach((item) => {
    headingLookup.set(item.text, [...(headingLookup.get(item.text) || []), item.id])
  })

  function consumeHeadingId(value: string) {
    const ids = headingLookup.get(value)
    return ids?.shift() || headingId(value)
  }

  return (
    <main className="article-detail">
      <header className="article-detail__header">
        <Link to="/articles">← 返回文章列表</Link>
        <p>
          {article.category.name} · {formatDate(article.publishedAt)}
        </p>
        <h1>{article.title}</h1>
        <div className="article-detail__tags">
          {article.tags.map((item) => (
            <span key={item.id}>#{item.name}</span>
          ))}
        </div>
        <p className="article-detail__summary">{article.summary}</p>
        {article.coverImageUrl && <img src={article.coverImageUrl} alt="" />}
      </header>

      <div className="article-detail__layout">
        {headings.length > 0 && (
          <aside className="article-detail__toc" aria-label="文章目录">
            <span>On this page</span>
            <ol>
              {headings.map((item) => (
                <li className={item.level === 3 ? 'is-subheading' : ''} key={item.id}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ol>
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
                return className || code.includes('\n') ? (
                  <CodeBlock className={className} code={code} />
                ) : (
                  <code>{children}</code>
                )
              },
              a: ({ href, children, ...props }) => {
                const external = href?.startsWith('http')
                return (
                  <a
                    href={href}
                    rel={external ? 'noreferrer noopener' : undefined}
                    target={external ? '_blank' : undefined}
                    {...props}
                  >
                    {children}
                  </a>
                )
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

export default ArticleDetail
