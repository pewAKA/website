import { afterEach, describe, expect, it, vi } from 'vitest'
import { preloadStartupAssets } from '@/three/assets/startup'

class SuccessfulImage {
  onerror: ((event: Event) => void) | null = null
  onload: ((event: Event) => void) | null = null

  set src(_: string) {
    queueMicrotask(() => this.onload?.(new Event('load')))
  }
}

class FailedImage {
  onerror: ((event: Event) => void) | null = null
  onload: ((event: Event) => void) | null = null

  set src(_: string) {
    queueMicrotask(() => this.onerror?.(new Event('error')))
  }
}

describe('preloadStartupAssets', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('回报启动资源的真实完成进度', async () => {
    vi.stubGlobal('Image', SuccessfulImage)
    const progress = vi.fn()

    const result = await preloadStartupAssets(progress)

    expect(result.failures).toHaveLength(0)
    expect(progress).toHaveBeenLastCalledWith(
      expect.objectContaining({ loaded: 1, progress: 100, total: 1 }),
    )
  })

  it('将加载失败的资源返回给预载屏处理', async () => {
    vi.stubGlobal('Image', FailedImage)

    const result = await preloadStartupAssets()

    expect(result.failures).toHaveLength(1)
    expect(result.failures[0].asset.id).toBe('home.hero')
  })
})
