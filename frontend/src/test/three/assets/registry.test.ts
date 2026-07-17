import { describe, expect, it, vi } from 'vitest'
import { AssetRegistry } from '@/three/assets/registry'

describe('AssetRegistry', () => {
  it('在资源空闲时驱逐并同时释放资源与缓存', () => {
    const registry = new AssetRegistry()
    const dispose = vi.fn()
    const clearCache = vi.fn()
    const release = registry.acquire('test.matcap.soft-clay', { dispose }, clearCache)

    release()

    expect(registry.requestEviction('test.matcap.soft-clay')).toBe('disposed')
    expect(dispose).toHaveBeenCalledOnce()
    expect(clearCache).toHaveBeenCalledOnce()
  })

  it('等待活跃组件释放后再驱逐资源', () => {
    const registry = new AssetRegistry()
    const dispose = vi.fn()
    const clearCache = vi.fn()
    const release = registry.acquire('test.tiles.color-repeat-10', { dispose }, clearCache)

    expect(registry.requestEviction('test.tiles.color-repeat-10')).toBe('pending')
    expect(dispose).not.toHaveBeenCalled()

    release()

    expect(dispose).toHaveBeenCalledOnce()
    expect(clearCache).toHaveBeenCalledOnce()
  })
})
