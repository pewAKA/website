import { useGLTF, useFont } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import {
  getAsset,
  getSceneAssets,
  type AssetDefinition,
  type AssetId,
  type SceneId,
} from './catalog'
import { assetRegistry } from './registry'

function queueLoaderPreload(asset: AssetDefinition) {
  switch (asset.kind) {
    case 'texture':
      useLoader.preload(TextureLoader, asset.url)
      return
    case 'environment':
      useLoader.preload(HDRLoader, asset.url)
      return
    case 'font':
      useFont.preload(asset.url)
      return
    case 'model':
      useGLTF.preload(asset.url)
      return
    case 'image':
      return
  }
}

async function warmNetworkCache(asset: AssetDefinition) {
  const response = await fetch(asset.url)
  if (!response.ok) {
    throw new Error(`${asset.label}加载失败（${response.status}）`)
  }
  await response.arrayBuffer()
}

/**
 * 预热浏览器网络缓存并将资源放入 R3F/Drei 缓存队列。
 */
export async function preloadAssetNetwork(asset: AssetDefinition) {
  queueLoaderPreload(asset)
  await warmNetworkCache(asset)
}

export async function preloadScene(sceneId: SceneId) {
  const assets = getSceneAssets(sceneId, 'critical')
  await Promise.all(assets.map(preloadAssetNetwork))
}

function clearLoaderCache(asset: AssetDefinition) {
  switch (asset.kind) {
    case 'texture':
      useLoader.clear(TextureLoader, asset.url)
      return
    case 'environment':
      useLoader.clear(HDRLoader, asset.url)
      return
    case 'font':
      useFont.clear(asset.url)
      return
    case 'model':
      useGLTF.clear(asset.url)
      return
    case 'image':
      return
  }
}

/**
 * 仅清除可选资源；仍被组件使用的资源会在最后一个引用释放后再销毁。
 */
export function evictScene(sceneId: SceneId) {
  for (const asset of getSceneAssets(sceneId, 'optional')) {
    const result = assetRegistry.requestEviction(asset.id as AssetId)
    if (result === 'missing') {
      clearLoaderCache(asset)
    }
  }
}

export function clearAsset(assetId: AssetId) {
  const asset = getAsset(assetId)
  const result = assetRegistry.requestEviction(assetId)
  if (result === 'missing') {
    clearLoaderCache(asset)
  }
}
