import type { ReactNode } from 'react'
import AdminProviders from '@/components/AdminProviders'
import 'antd/dist/reset.css'

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>
}
