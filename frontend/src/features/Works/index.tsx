import Image from 'next/image'
import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'
import { projects, type ProjectEntry } from './projects'
import './index.scss'

const categoryLabels: Record<ProjectEntry['category'], string> = {
  shader: 'Shader',
  particles: 'Particles',
  scroll: 'Scroll',
}

export default function Works() {
  return (
    <div className="works-page">
      <header className="works-intro">
        <p>Project Works / Interactive Lab</p>
        <h1>
          交互实验，
          <span>保持可进入。</span>
        </h1>
        <div>
          <p>这里收录正在推进的实时图形实验。每一项都保留运行中的代码、限制和下一次迭代方向。</p>
          <strong>{projects.length} 个公开实验</strong>
        </div>
      </header>

      <section className="works-snapshot" aria-labelledby="snapshot-title">
        <header>
          <h2 id="snapshot-title">场景规模</h2>
          <p>以下数值来自当前实现，用来快速理解每个实验的工作边界。</p>
        </header>
        <div className="works-snapshot__list">
          {projects.map((project) => (
            <Link href={project.href} key={project.slug}>
              <span>{project.title}</span>
              <strong>{project.scale}</strong>
              <small>{project.focus}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="works-gallery" aria-label="公开实验列表">
        {projects.map((project) => (
          <Link
            className={`works-project works-project--${project.slug}`}
            href={project.href}
            key={project.slug}
          >
            <div className="works-project__media">
              <Image
                src={project.posterSrc}
                alt={`${project.title} 实验海报`}
                fill
                sizes={project.slug === 'galaxy' ? '100vw' : '(max-width: 767px) 100vw, 50vw'}
                priority={project.slug === 'galaxy'}
              />
            </div>
            <div className="works-project__content">
              <div className="works-project__title">
                <h2>{project.title}</h2>
                <span>{categoryLabels[project.category]}</span>
              </div>
              <p>{project.description}</p>
              <dl className="works-project__brief">
                <div>
                  <dt>当前关注</dt>
                  <dd>{project.focus}</dd>
                </div>
                <div>
                  <dt>当前限制</dt>
                  <dd>{project.constraint}</dd>
                </div>
                <div>
                  <dt>下一次迭代</dt>
                  <dd>{project.nextIteration}</dd>
                </div>
              </dl>
              <dl className="works-project__meta">
                <div>
                  <dt>状态</dt>
                  <dd>{project.status === 'lab' ? '持续实验' : '已发布'}</dd>
                </div>
                <div>
                  <dt>技术</dt>
                  <dd>{project.technologies.join(' / ')}</dd>
                </div>
                <div>
                  <dt>年份</dt>
                  <dd>{project.year}</dd>
                </div>
              </dl>
            </div>
          </Link>
        ))}
      </section>

      <SiteFooter />
    </div>
  )
}
