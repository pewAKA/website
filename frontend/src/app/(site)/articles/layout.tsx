import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { getDocsSource } from '@/lib/docs/source'
import { getAdminSession } from '@/server/auth/session'
import '@/features/Docs/index.scss'

export const dynamic = 'force-dynamic'

export default async function ArticlesLayout({ children }: { children: ReactNode }) {
  const [source, adminSession] = await Promise.all([getDocsSource(), getAdminSession()])

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
        ...(adminSession
          ? [{ text: '文档工作台', url: '/articles/manage', active: 'nested-url' as const }]
          : []),
      ]}
      sidebar={{ defaultOpenLevel: 1, prefetch: true }}
      containerProps={{ className: 'lynco-docs-shell' }}
    >
      {children}
    </DocsLayout>
  )
}
