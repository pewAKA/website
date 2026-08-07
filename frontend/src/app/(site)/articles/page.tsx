import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedArticles, getPublishedTaxonomy } from '@/services/articles.server'
import '@/features/Articles/index.scss'

export const metadata: Metadata = {
  title: '技术文章',
  description: '沉淀 React、TypeScript、工程化与交互设计中的实践记录。',
  alternates: { canonical: '/articles' },
}

const pageSize = 12
type SearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function parsePage(value: string) {
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function createHref(current: URLSearchParams, updates: Record<string, string | null>) {
  const next = new URLSearchParams(current)
  for (const [key, value] of Object.entries(updates)) {
    if (value) next.set(key, value)
    else next.delete(key)
  }
  const query = next.toString()
  return query ? `/articles?${query}` : '/articles'
}

function formatDate(value: string | null) {
  if (!value) return '未发布'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolved = await searchParams
  const category = firstValue(resolved.category)
  const tag = firstValue(resolved.tag)
  const page = parsePage(firstValue(resolved.page) || '1')
  const current = new URLSearchParams()
  if (category) current.set('category', category)
  if (tag) current.set('tag', tag)
  if (page > 1) current.set('page', String(page))

  const [result, taxonomy] = await Promise.all([
    getPublishedArticles({ category: category || undefined, tag: tag || undefined, page, pageSize }),
    getPublishedTaxonomy(),
  ])
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize))

  return (
    <main className="articles-page">
      <header className="articles-page__masthead">
        <p>Technical field notes</p>
        <h1>技术文章</h1>
        <div>
          <span>把项目里反复验证的过程，整理成下一次能直接找到的答案。</span>
          <strong>{result.total} 篇已发布记录</strong>
        </div>
      </header>

      <section className="articles-page__filters" aria-label="文章筛选">
        <div>
          <span>分类</span>
          <Link className={!category ? 'is-active' : ''} href={createHref(current, { category: null, page: null })}>全部</Link>
          {taxonomy.categories.map((item) => (
            <Link className={category === item.slug ? 'is-active' : ''} href={createHref(current, { category: item.slug, page: null })} key={item.id}>
              {item.name} <small>{item.articleCount}</small>
            </Link>
          ))}
        </div>
        {taxonomy.tags.length > 0 && (
          <div>
            <span>标签</span>
            <Link className={!tag ? 'is-active' : ''} href={createHref(current, { tag: null, page: null })}>所有主题</Link>
            {taxonomy.tags.map((item) => (
              <Link className={tag === item.slug ? 'is-active' : ''} href={createHref(current, { tag: item.slug, page: null })} key={item.id}>#{item.name}</Link>
            ))}
          </div>
        )}
      </section>

      {result.items.length === 0 ? (
        <section className="articles-page__empty">
          <span>还没有匹配的记录</span>
          <p>调整分类或标签，或者等待下一篇文章发布。</p>
          {(category || tag) && <Link href="/articles">清除筛选</Link>}
        </section>
      ) : (
        <section className="articles-page__list" aria-label="文章列表">
          {result.items.map((article, index) => (
            <Link className="article-card" key={article.id} href={`/articles/${article.slug}`}>
              <span className="article-card__index">{String((page - 1) * pageSize + index + 1).padStart(2, '0')}</span>
              <div className="article-card__content">
                <div className="article-card__meta"><span>{article.category.name}</span><time>{formatDate(article.publishedAt)}</time></div>
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
                <div className="article-card__tags">{article.tags.map((item) => <span key={item.id}>#{item.name}</span>)}</div>
              </div>
              {article.coverImageUrl && <img src={article.coverImageUrl} alt="" />}
              <span className="article-card__arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </section>
      )}

      {totalPages > 1 && (
        <nav className="articles-page__pagination" aria-label="文章分页">
          {page <= 1 ? <span aria-disabled="true">上一页</span> : <Link href={createHref(current, { page: page - 1 <= 1 ? null : String(page - 1) })}>上一页</Link>}
          <span>第 {page} / {totalPages} 页</span>
          {page >= totalPages ? <span aria-disabled="true">下一页</span> : <Link href={createHref(current, { page: String(page + 1) })}>下一页</Link>}
        </nav>
      )}
    </main>
  )
}
