import type { ReactNode } from 'react'
import AdminGuard from '@/components/AdminProviders/AdminGuard'
import { AdminLayout } from '@/features/Admin'

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuard><AdminLayout>{children}</AdminLayout></AdminGuard>
}
