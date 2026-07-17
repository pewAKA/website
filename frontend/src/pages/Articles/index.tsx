import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { articlesQueryOptions, taxonomyQueryOptions } from '@/queries/articleQueries'
import { useDocumentMetadata } from '@/utils/seo'
import './index.scss'

const pageSize = 12

function formatDate(value: string | null) {
  if (!value) {
    return '未发布'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function Articles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const tag = searchParams.get('tag') || ''
  const page = Number(searchParams.get('page') || '1')
  const articlesQuery = useQuery(
    articlesQueryOptions({
      category: category || undefined,
      tag: tag || undefined,
      page,
      pageSize,
    }),
  )
  const taxonomyQuery = useQuery(taxonomyQueryOptions())
  const articles = articlesQuery.data?.items || []
  const taxonomy = taxonomyQuery.data || { categories: [], tags: [] }
  const total = articlesQuery.data?.total || 0
  const loading = articlesQuery.isPending || taxonomyQuery.isPending
  const queryError = articlesQuery.error || taxonomyQuery.error
  const error = queryError instanceof Error ? queryError.message : ''

  useDocumentMetadata({
    title: '技术文章 · Lynco Hub',
    description: '沉淀 React、TypeScript、工程化与交互设计中的实践记录。',
    canonicalPath: '/articles',
  })

  function updateFilter(key: 'category' | 'tag', value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.delete('page')
    setSearchParams(next)
  }

  function updatePage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }
    setSearchParams(next)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <main className="articles-page">
      <header className="articles-page__masthead">
        <p>Technical field notes</p>
        <h1>技术文章</h1>
        <div>
          <span>把项目里反复验证的过程，整理成下一次能直接找到的答案。</span>
          <strong>{total} 篇已发布记录</strong>
        </div>
      </header>

      <section className="articles-page__filters" aria-label="文章筛选">
        <div>
          <span>分类</span>
          <button
            className={!category ? 'is-active' : ''}
            type="button"
            onClick={() => updateFilter('category', '')}
          >
            全部
          </button>
          {taxonomy.categories.map((item) => (
            <button
              className={category === item.slug ? 'is-active' : ''}
              key={item.id}
              type="button"
              onClick={() => updateFilter('category', item.slug)}
            >
              {item.name} <small>{item.articleCount}</small>
            </button>
          ))}
        </div>
        {taxonomy.tags.length > 0 && (
          <div>
            <span>标签</span>
            <button
              className={!tag ? 'is-active' : ''}
              type="button"
              onClick={() => updateFilter('tag', '')}
            >
              所有主题
            </button>
            {taxonomy.tags.map((item) => (
              <button
                className={tag === item.slug ? 'is-active' : ''}
                key={item.id}
                type="button"
                onClick={() => updateFilter('tag', item.slug)}
              >
                #{item.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {loading && <p className="articles-page__state">正在整理文章索引…</p>}
      {!loading && error && (
        <p className="articles-page__state articles-page__state--error">{error}</p>
      )}
      {!loading && !error && articles.length === 0 && (
        <section className="articles-page__empty">
          <span>还没有匹配的记录</span>
          <p>调整分类或标签，或者等待下一篇文章发布。</p>
          {(category || tag) && (
            <button type="button" onClick={() => setSearchParams({})}>
              清除筛选
            </button>
          )}
        </section>
      )}

      {!loading && !error && articles.length > 0 && (
        <section className="articles-page__list" aria-label="文章列表">
          {articles.map((article, index) => (
            <Link className="article-card" key={article.id} to={`/articles/${article.slug}`}>
              <span className="article-card__index">
                {String((page - 1) * pageSize + index + 1).padStart(2, '0')}
              </span>
              <div className="article-card__content">
                <div className="article-card__meta">
                  <span>{article.category.name}</span>
                  <time>{formatDate(article.publishedAt)}</time>
                </div>
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
                <div className="article-card__tags">
                  {article.tags.map((item) => (
                    <span key={item.id}>#{item.name}</span>
                  ))}
                </div>
              </div>
              {article.coverImageUrl && <img src={article.coverImageUrl} alt="" />}
              <span className="article-card__arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </section>
      )}

      {totalPages > 1 && (
        <nav className="articles-page__pagination" aria-label="文章分页">
          <button disabled={page <= 1} type="button" onClick={() => updatePage(page - 1)}>
            上一页
          </button>
          <span>
            第 {page} / {totalPages} 页
          </span>
          <button disabled={page >= totalPages} type="button" onClick={() => updatePage(page + 1)}>
            下一页
          </button>
        </nav>
      )}
    </main>
  )
}

export default Articles
