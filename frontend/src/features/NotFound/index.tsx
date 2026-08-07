import Link from 'next/link'
import './index.scss'

function NotFound() {
  return (
    <div className="not-found-page">
      <section>
        <p>404</p>
        <h1>页面不存在</h1>
        <span>当前地址没有匹配到页面，请返回首页继续浏览。</span>
        <Link href="/">返回首页</Link>
      </section>
    </div>
  )
}

export default NotFound
