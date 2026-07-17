import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import StartupPreloader from '@/components/StartupPreloader'
import { StartupPreloadProvider } from '@/providers/StartupPreloadProvider'

const mockPreloadStartupAssets = vi.hoisted(() => vi.fn())

vi.mock('@/three/assets/startup', () => ({
  preloadStartupAssets: mockPreloadStartupAssets,
}))

function renderPreloader() {
  return render(
    <StartupPreloadProvider>
      <StartupPreloader />
    </StartupPreloadProvider>,
  )
}

describe('StartupPreloadProvider', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    mockPreloadStartupAssets.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('在首页入口显示进度并在成功后进入完成阶段', async () => {
    mockPreloadStartupAssets.mockImplementation(async (onProgress) => {
      onProgress?.({ loaded: 0, total: 1, currentAsset: '首页主视觉', progress: 0 })
      onProgress?.({ loaded: 1, total: 1, currentAsset: '首页主视觉', progress: 100 })
      return { failures: [] }
    })

    renderPreloader()

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(await screen.findByText('资源准备完成')).toBeInTheDocument()
    expect(screen.getByText('100% · 1 / 1')).toBeInTheDocument()
  })

  it('在失败时允许重试或跳过', async () => {
    mockPreloadStartupAssets.mockImplementation(async (onProgress) => {
      onProgress?.({ loaded: 1, total: 1, currentAsset: '首页主视觉', progress: 100 })
      return {
        failures: [
          {
            asset: {
              id: 'home.hero',
              kind: 'image',
              label: '首页主视觉',
              residency: 'startup',
              scene: 'home',
              url: '/hero.png',
            },
            error: new Error('加载失败'),
          },
        ],
      }
    })

    renderPreloader()

    const retry = await screen.findByRole('button', { name: '重试' })
    fireEvent.click(retry)
    await waitFor(() => expect(mockPreloadStartupAssets).toHaveBeenCalledTimes(2))

    fireEvent.click(screen.getByRole('button', { name: '跳过进入' }))
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('直接进入非首页路径时不启动预载', () => {
    window.history.replaceState({}, '', '/articles')

    renderPreloader()

    expect(mockPreloadStartupAssets).not.toHaveBeenCalled()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
