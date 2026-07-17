import { getStartupAssets, type AssetDefinition } from './catalog'

export type StartupPreloadProgress = {
  loaded: number
  total: number
  currentAsset: string
  progress: number
}

export type StartupPreloadFailure = {
  asset: AssetDefinition
  error: Error
}

export type StartupPreloadResult = {
  failures: StartupPreloadFailure[]
}

function preloadImage(asset: AssetDefinition) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => reject(new Error(`${asset.label}加载失败`))
    image.src = asset.url
  })
}

async function preloadAsset(asset: AssetDefinition) {
  if (asset.kind === 'image') {
    return preloadImage(asset)
  }

  // 首页未来加入 Three 资源时才动态载入场景预加载器，避免首屏引入 Three.js 运行时代码。
  const { preloadAssetNetwork } = await import('./preload')
  await preloadAssetNetwork(asset)
}

export async function preloadStartupAssets(
  onProgress?: (progress: StartupPreloadProgress) => void,
): Promise<StartupPreloadResult> {
  const assets = getStartupAssets()
  const total = assets.length
  const failures: StartupPreloadFailure[] = []
  let loaded = 0

  onProgress?.({
    loaded,
    total,
    currentAsset: total > 0 ? assets[0].label : '初始化完成',
    progress: total === 0 ? 100 : 0,
  })

  await Promise.all(
    assets.map(async (asset) => {
      try {
        await preloadAsset(asset)
      } catch (error) {
        failures.push({
          asset,
          error: error instanceof Error ? error : new Error(`${asset.label}加载失败`),
        })
      } finally {
        loaded += 1
        onProgress?.({
          loaded,
          total,
          currentAsset: asset.label,
          progress: total === 0 ? 100 : Math.round((loaded / total) * 100),
        })
      }
    }),
  )

  return { failures }
}
