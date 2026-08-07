import type { ReactNode } from 'react'
import AppShell from '@/components/AppShell'
import '@/App.scss'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
