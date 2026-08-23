import Image from 'next/image'
import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'
import { projects } from '@/features/Works/projects'
import HeroArtifactClient from './HeroArtifactClient'
import { mockLabNotes } from './mock-content'
import './index.scss'

type ArticlePreview = {
  id: string
  title: string
  href: string
  publishedAt: string
  categoryName: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export default function Home({ articles }: { articles: ArticlePreview[] }) {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Creative Developer / Interactive Web</p>
          <h1 id="home-title">
            <span>为浏览器创造</span>
            <span>有触感的体验。</span>
          </h1>
          <p className="home-hero__summary">
            在代码、实时图形与产品体验之间，构建可复用的交互实验。
          </p>
          <div className="home-hero__actions">
            <Link className="home-button home-button--primary" href="/works">
              查看实验
            </Link>
            <Link className="home-button" href="/articles">
              阅读文章
            </Link>
          </div>
        </div>

        <div className="home-hero__visual">
          <HeroArtifactClient />
        </div>
      </section>

      <section className="home-manifesto" aria-labelledby="manifesto-title">
        <h2 id="manifesto-title">
          把技术实验做成可进入的空间，
          <span>让实现过程也值得被看见。</span>
        </h2>
        <p>
          Lynco Hub
          记录着色器、粒子系统、滚动叙事和前端工程中的真实尝试。每个实验都可以打开、观察并继续迭代。
        </p>
      </section>

      <section className="home-ledger" aria-labelledby="ledger-title">
        <header className="home-ledger__heading">
          <div>
            <h2 id="ledger-title">实验日志预览</h2>
            <p>用具体的调整记录替代抽象口号。以下内容是用于版式预览的模拟数据。</p>
          </div>
          <span>Mock content</span>
        </header>

        <ol className="home-ledger__list">
          {mockLabNotes.map((note) => (
            <li key={`${note.date}-${note.title}`}>
              <Link href={note.href}>
                <time dateTime={note.date}>{note.displayDate}</time>
                <div>
                  <span>{note.project}</span>
                  <h3>{note.title}</h3>
                  <p>{note.summary}</p>
                </div>
                <strong>查看实验</strong>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="selected-work" aria-labelledby="selected-work-title">
        <div className="selected-work__heading">
          <h2 id="selected-work-title">正在构建的实验</h2>
          <p>三个方向，分别研究空间、材质与时间如何进入网页。</p>
        </div>

        <div className="selected-work__grid">
          {projects.map((project) => (
            <Link
              className={`home-project home-project--${project.slug}`}
              href={project.href}
              key={project.slug}
              aria-label={`打开 ${project.title} 实验`}
            >
              <div className="home-project__media">
                <Image
                  src={project.posterSrc}
                  alt={`${project.title} 实验海报`}
                  fill
                  sizes="(max-width: 767px) 100vw, 66vw"
                />
              </div>
              <div className="home-project__caption">
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <dl className="home-project__facts">
                    <div>
                      <dt>当前关注</dt>
                      <dd>{project.focus}</dd>
                    </div>
                    <div>
                      <dt>场景规模</dt>
                      <dd>{project.scale}</dd>
                    </div>
                  </dl>
                </div>
                <span>{project.technologies.join(' / ')}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-method" aria-labelledby="method-title">
        <div className="home-method__statement">
          <h2 id="method-title">从着色器到界面系统。</h2>
          <p>视觉只负责第一眼，稳定的渲染、可访问的内容和清晰的结构负责让体验成立。</p>
        </div>
        <div className="home-method__practice" aria-label="实验构建方法">
          <ol>
            <li>
              <span>原型</span>
              <div>
                <h3>先做可运行的最小场景</h3>
                <p>只保留一个视觉问题，确认交互是否值得继续。</p>
              </div>
              <code>Three.js / GLSL</code>
            </li>
            <li>
              <span>稳定</span>
              <div>
                <h3>限制渲染成本与状态更新</h3>
                <p>为移动设备、低动态偏好和上下文中断准备退路。</p>
              </div>
              <code>R3F / React</code>
            </li>
            <li>
              <span>记录</span>
              <div>
                <h3>把取舍写回界面</h3>
                <p>让场景规模、当前限制和下一步都可以被看见。</p>
              </div>
              <code>Next.js / TypeScript</code>
            </li>
          </ol>
        </div>
      </section>

      <section className="home-writing" aria-labelledby="writing-title">
        <div className="home-writing__heading">
          <div>
            <h2 id="writing-title">最近写下的内容</h2>
            <p>当前使用与文档门户一致的 Mock 数据，验证真实标题和阅读节奏。</p>
          </div>
          <Link href="/articles">阅读文章</Link>
        </div>

        <div className="home-writing__list">
          {articles.map((article) => (
            <Link href={article.href} key={article.id}>
              <span>{article.categoryName}</span>
              <h3>{article.title}</h3>
              <div>
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                <strong>阅读全文</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
