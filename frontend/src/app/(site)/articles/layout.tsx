import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { getDocsSource } from '@/lib/docs/source'
import '@/features/Docs/index.scss'

export default async function ArticlesLayout({ children }: { children: ReactNode }) {
  const source = await getDocsSource()

  return (
    <DocsLayout
      tree={source.getPageTree()}
      tabs={false}
      themeSwitch={{ enabled: false }}
      nav={{
        title: (
          <span className="docs-brand">
            <span className="docs-brand__mark">LH</span>
            <span>Lynco Hub</span>
            <span className="docs-brand__section">/ Notes</span>
          </span>
        ),
        url: '/articles',
        transparentMode: 'none',
      }}
      links={[
        { text: '首页', url: '/', active: 'none' },
        { text: '作品', url: '/works', active: 'none' },
        { text: '关于', url: '/about', active: 'none' },
      ]}
      sidebar={{ defaultOpenLevel: 1, prefetch: true }}
      containerProps={{ className: 'lynco-docs-shell' }}
    >
      {children}
    </DocsLayout>
  )
}
