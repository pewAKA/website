import { useGLTF, useFont } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { useEffect } from 'react'
import {
  EquirectangularReflectionMapping,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Material,
  type Object3D,
  type Texture,
} from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { getAsset, type AssetId } from './catalog'
import { assetRegistry } from './registry'

function requireKind(assetId: AssetId, kind: 'texture' | 'environment' | 'font' | 'model') {
  const asset = getAsset(assetId)
  if (asset.kind !== kind) {
    throw new Error(`资源“${assetId}”不是${kind}类型`)
  }
  return asset
}

function applyTextureSettings(texture: Texture, assetId: AssetId) {
  const asset = getAsset(assetId)
  const settings = asset.texture
  if (!settings) {
    return texture
  }

  texture.colorSpace = settings.colorSpace === 'srgb' ? SRGBColorSpace : NoColorSpace
  if (settings.wrap === 'repeat') {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
  }
  if (settings.repeat) {
    texture.repeat.set(settings.repeat[0], settings.repeat[1])
  }
  texture.needsUpdate = true
  return texture
}

/**
 * 获取配置固定的共享纹理。不同重复方式使用不同资源 ID，避免组件互相改写采样状态。
 */
export function useManagedTexture(assetId: AssetId) {
  const asset = requireKind(assetId, 'texture')
  const texture = useLoader(TextureLoader, asset.url)
  applyTextureSettings(texture, assetId)

  useEffect(
    () =>
      assetRegistry.acquire(assetId, texture, () => {
        useLoader.clear(TextureLoader, asset.url)
      }),
    [asset.url, assetId, texture],
  )

  return texture
}

/**
 * 获取并注册 HDR 环境贴图。组件离开场景只解绑背景，真正的释放由 registry 决定。
 */
export function useSceneEnvironment(assetId: AssetId) {
  const asset = requireKind(assetId, 'environment')
  const texture = useLoader(HDRLoader, asset.url)
  texture.mapping = EquirectangularReflectionMapping

  useEffect(
    () =>
      assetRegistry.acquire(assetId, texture, () => {
        useLoader.clear(HDRLoader, asset.url)
      }),
    [asset.url, assetId, texture],
  )

  return texture
}

/**
 * Text3D 仍接收 URL，由 Drei 内部缓存字体；registry 负责在显式驱逐时清理该缓存。
 */
export function useManagedFontUrl(assetId: AssetId) {
  const asset = requireKind(assetId, 'font')

  useEffect(
    () =>
      assetRegistry.acquire(assetId, null, () => {
        useFont.clear(asset.url)
      }),
    [asset.url, assetId],
  )

  return asset.url
}

function disposeMaterial(material: Material) {
  material.dispose()
}

function disposeModelScene(scene: Object3D) {
  scene.traverse((object) => {
    const mesh = object as Object3D & {
      geometry?: { dispose?: () => void }
      material?: Material | Material[]
    }
    mesh.geometry?.dispose?.()
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(disposeMaterial)
    } else if (mesh.material) {
      disposeMaterial(mesh.material)
    }
  })
}

/**
 * 为未来 GLTF 资源提供统一缓存入口；调用方必须 clone 返回的 scene 再创建多个实例。
 */
export function useManagedModel(assetId: AssetId) {
  const asset = requireKind(assetId, 'model')
  const gltf = useGLTF(asset.url)

  useEffect(
    () =>
      assetRegistry.acquire(assetId, { dispose: () => disposeModelScene(gltf.scene) }, () =>
        useGLTF.clear(asset.url),
      ),
    [asset.url, assetId, gltf.scene],
  )

  return gltf
}
