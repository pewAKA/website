import Link from 'next/link'
import './index.scss'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Link href="/">Lynco Hub</Link>
        <p>代码、实时图形与持续记录。</p>
      </div>
      <nav aria-label="页尾导航">
        <Link href="/works">作品</Link>
        <Link href="/articles">文章</Link>
        <Link href="/about">关于</Link>
        <Link href="/roadmap">路线图</Link>
      </nav>
    </footer>
  )
}
