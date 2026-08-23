import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/features/Admin'
import { getAdminSession } from '@/server/auth/session'

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  if (!(await getAdminSession())) redirect('/admin/login')
  return <AdminLayout>{children}</AdminLayout>
}
