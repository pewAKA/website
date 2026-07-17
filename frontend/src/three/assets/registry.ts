import { getAsset, getSceneAssets, type AssetId, type SceneId } from './catalog'

type DisposableResource = {
  dispose?: () => void
}

type CacheClearer = () => void

type ResourceRecord = {
  resource: DisposableResource | null
  references: number
  clearCache: CacheClearer
  evictWhenUnused: boolean
}

export type EvictionResult = 'missing' | 'disposed' | 'pending'

/**
 * 仅管理共享资源的引用与销毁，不保存任何界面交互状态。
 */
export class AssetRegistry {
  private records = new Map<AssetId, ResourceRecord>()

  acquire(assetId: AssetId, resource: DisposableResource | null, clearCache: CacheClearer) {
    const current = this.records.get(assetId)
    if (current) {
      current.references += 1
      return () => this.release(assetId)
    }

    this.records.set(assetId, {
      resource,
      references: 1,
      clearCache,
      evictWhenUnused: false,
    })
    return () => this.release(assetId)
  }

  release(assetId: AssetId) {
    const record = this.records.get(assetId)
    if (!record) {
      return
    }

    record.references = Math.max(0, record.references - 1)
    if (record.references === 0 && record.evictWhenUnused) {
      this.dispose(assetId, record)
    }
  }

  requestEviction(assetId: AssetId): EvictionResult {
    const record = this.records.get(assetId)
    if (!record) {
      return 'missing'
    }
    if (record.references > 0) {
      record.evictWhenUnused = true
      return 'pending'
    }

    this.dispose(assetId, record)
    return 'disposed'
  }

  evictScene(sceneId: SceneId) {
    return getSceneAssets(sceneId, 'optional').map((asset) => ({
      assetId: asset.id as AssetId,
      result: this.requestEviction(asset.id as AssetId),
    }))
  }

  getReferenceCount(assetId: AssetId) {
    return this.records.get(assetId)?.references || 0
  }

  reset() {
    for (const [assetId, record] of this.records) {
      this.dispose(assetId, record)
    }
  }

  private dispose(assetId: AssetId, record: ResourceRecord) {
    record.resource?.dispose?.()
    record.clearCache()
    this.records.delete(assetId)
  }
}

export const assetRegistry = new AssetRegistry()

/**
 * 供非 React 场景控制器按资源 ID 请求释放，活跃资源会等到最后一个使用者卸载后再释放。
 */
export function requestAssetEviction(assetId: AssetId) {
  return assetRegistry.requestEviction(assetId)
}

export function getAssetLabel(assetId: AssetId) {
  return getAsset(assetId).label
}
