'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { StartupPreloadContext, type StartupPreloadState } from './startupPreloadContext'

function createLoadingState(): StartupPreloadState {
  return {
    visible: true,
    phase: 'loading',
    progress: 0,
    loaded: 0,
    total: 0,
    currentAsset: '初始化首页资源',
    failures: [],
  }
}

export function StartupPreloadProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const shouldPreload = useRef(pathname === '/').current
  const hasStarted = useRef(false)
  const runId = useRef(0)
  const hideTimer = useRef<number | undefined>(undefined)
  const [state, setState] = useState<StartupPreloadState>(() =>
    shouldPreload
      ? createLoadingState()
      : { ...createLoadingState(), phase: 'skipped', visible: false },
  )

  const skip = useCallback(() => {
    runId.current += 1
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current)
    }
    setState((current) => ({ ...current, phase: 'skipped', visible: false }))
  }, [])

  const start = useCallback(() => {
    if (!shouldPreload) {
      return
    }

    const currentRun = runId.current + 1
    runId.current = currentRun
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current)
    }
    setState(createLoadingState())

    // 仅首页真正开始加载时才引入 Three.js 资源模块，避免进入公共客户端包。
    void import('@/three/assets/startup').then(({ preloadStartupAssets }) => preloadStartupAssets((progress) => {
      if (runId.current !== currentRun) {
        return
      }
      setState((current) => ({
        ...current,
        phase: 'loading',
        progress: progress.progress,
        loaded: progress.loaded,
        total: progress.total,
        currentAsset: progress.currentAsset,
      }))
    })).then(({ failures }) => {
      if (runId.current !== currentRun) {
        return
      }
      if (failures.length > 0) {
        setState((current) => ({ ...current, phase: 'error', failures }))
        return
      }

      setState((current) => ({ ...current, phase: 'complete', progress: 100 }))
      hideTimer.current = window.setTimeout(() => {
        if (runId.current === currentRun) {
          setState((current) => ({ ...current, phase: 'skipped', visible: false }))
        }
      }, 320)
    })
  }, [shouldPreload])

  const retry = useCallback(() => {
    start()
  }, [start])

  useEffect(() => {
    if (hasStarted.current || !shouldPreload) {
      return
    }
    hasStarted.current = true
    start()

    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current)
      }
    }
  }, [shouldPreload, start])

  return (
    <StartupPreloadContext.Provider value={{ ...state, retry, skip }}>
      {children}
    </StartupPreloadContext.Provider>
  )
}
