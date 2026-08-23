export default function ArticlesLoading() {
  return (
    <div className="docs-loading" aria-label="正在整理文档">
      <aside className="docs-loading__sidebar" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} />
        ))}
      </aside>
      <main className="docs-loading__body" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </main>
      <aside className="docs-loading__toc" aria-hidden="true" />
    </div>
  )
}
