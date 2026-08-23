import Link from 'next/link'
import type { ReactNode } from 'react'
import './index.scss'

type ExperimentFrameProps = {
  title: string
  description: string
  technologies: string[]
  children: ReactNode
}

export default function ExperimentFrame({
  title,
  description,
  technologies,
  children,
}: ExperimentFrameProps) {
  return (
    <section className="experiment-frame">
      <header className="experiment-frame__header">
        <Link href="/works">
          <span className="experiment-frame__mark">LH</span>
          <span>返回作品</span>
        </Link>
        <div>
          <p>Interactive Lab</p>
          <h1>{title}</h1>
        </div>
      </header>

      <div className="experiment-frame__stage">{children}</div>

      <footer className="experiment-frame__meta">
        <p>{description}</p>
        <span>{technologies.join(' / ')}</span>
      </footer>
    </section>
  )
}
