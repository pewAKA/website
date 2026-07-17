import { createContext, useContext } from 'react'
import type { StartupPreloadFailure } from '@/three/assets/startup'

export type StartupPreloadPhase = 'loading' | 'complete' | 'error' | 'skipped'

export type StartupPreloadState = {
  visible: boolean
  phase: StartupPreloadPhase
  progress: number
  loaded: number
  total: number
  currentAsset: string
  failures: StartupPreloadFailure[]
}

export type StartupPreloadContextValue = StartupPreloadState & {
  retry: () => void
  skip: () => void
}

export const StartupPreloadContext = createContext<StartupPreloadContextValue | null>(null)

export function useStartupPreload() {
  const context = useContext(StartupPreloadContext)
  if (!context) {
    throw new Error('useStartupPreload 必须在 StartupPreloadProvider 内调用')
  }
  return context
}
