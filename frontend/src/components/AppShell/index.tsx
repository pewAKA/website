'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import FloatingNav from '@/components/FloatingNav'

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isExperiment = ['/works/waves', '/works/galaxy', '/works/scroll'].some(
    (route) => pathname === route,
  )
  const isDocs = pathname === '/articles' || pathname.startsWith('/articles/')

  return (
    <div
      className={`app-shell${isExperiment ? ' app-shell--experiment' : ''}${isDocs ? ' app-shell--docs' : ''}`}
    >
      {!isExperiment && !isDocs && <FloatingNav />}
      {children}
    </div>
  )
}
