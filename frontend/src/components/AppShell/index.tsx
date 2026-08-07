'use client'

import type { ReactNode } from 'react'
import FloatingNav from '@/components/FloatingNav'
import StartupPreloader from '@/components/StartupPreloader'
import { StartupPreloadProvider } from '@/providers/StartupPreloadProvider'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <StartupPreloadProvider>
      <main className="app-shell">
        <FloatingNav />
        {children}
      </main>
      <StartupPreloader />
    </StartupPreloadProvider>
  )
}
