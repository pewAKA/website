export {
  assetCatalog,
  getAsset,
  getSceneAssets,
  getStartupAssets,
  type AssetDefinition,
  type AssetId,
  type AssetKind,
  type AssetResidency,
  type SceneId,
} from './catalog'
export { useManagedFontUrl, useManagedModel, useManagedTexture, useSceneEnvironment } from './hooks'
export { clearAsset, evictScene, preloadScene } from './preload'
export { assetRegistry, AssetRegistry } from './registry'
export { preloadStartupAssets, type StartupPreloadProgress } from './startup'
