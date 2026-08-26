import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import AdminProviders from '@/components/AdminProviders'
import { DocsWorkbenchShell } from '@/features/DocsManager'
import { getAdminSession } from '@/server/auth/session'
import '@mdxeditor/editor/style.css'

export const metadata: Metadata = { title: '文档工作台', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function DocsManageLayout({ children }: { children: ReactNode }) {
  if (!(await getAdminSession())) {
    redirect('/admin/login?callbackURL=%2Farticles%2Fmanage')
  }

  return (
    // 作为 DocsLayout 的直接网格项，避免窄屏时被自动网格压缩。
    <div className="workbench-layout-main">
      <AdminProviders>
        <DocsWorkbenchShell>{children}</DocsWorkbenchShell>
      </AdminProviders>
    </div>
  )
}
