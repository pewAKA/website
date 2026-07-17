import { assetUrls } from './urls'

export type SceneId = 'home' | 'test'
export type AssetKind = 'image' | 'texture' | 'environment' | 'font' | 'model'
export type AssetResidency = 'startup' | 'critical' | 'optional'
export type TextureColorSpace = 'srgb' | 'linear'

export type TextureSettings = {
  colorSpace: TextureColorSpace
  repeat?: readonly [number, number]
  wrap?: 'repeat'
}

export type AssetDefinition = {
  id: string
  label: string
  kind: AssetKind
  url: string
  scene: SceneId
  residency: AssetResidency
  texture?: TextureSettings
}

export const assetCatalog = {
  'home.hero': {
    id: 'home.hero',
    label: '首页主视觉',
    kind: 'image',
    url: assetUrls.homeHero,
    scene: 'home',
    residency: 'startup',
  },
  'test.environment.historic-cloister': {
    id: 'test.environment.historic-cloister',
    label: 'Historic Cloister HDR 环境',
    kind: 'environment',
    url: assetUrls.environments.historicCloister,
    scene: 'test',
    residency: 'critical',
  },
  'test.environment.monochrome-studio': {
    id: 'test.environment.monochrome-studio',
    label: 'Monochrome Studio HDR 环境',
    kind: 'environment',
    url: assetUrls.environments.monochromeStudio,
    scene: 'test',
    residency: 'optional',
  },
  'test.font.georgia': {
    id: 'test.font.georgia',
    label: 'Georgia 三维字体',
    kind: 'font',
    url: assetUrls.fonts.georgia,
    scene: 'test',
    residency: 'critical',
  },
  'test.matcap.soft-clay': {
    id: 'test.matcap.soft-clay',
    label: 'Soft Clay MatCap',
    kind: 'texture',
    url: assetUrls.matcaps.softClay,
    scene: 'test',
    residency: 'critical',
    texture: { colorSpace: 'srgb' },
  },
  'test.tiles.color-repeat-10': {
    id: 'test.tiles.color-repeat-10',
    label: 'Tiles 色彩图（重复 10 次）',
    kind: 'texture',
    url: assetUrls.tiles.color,
    scene: 'test',
    residency: 'critical',
    texture: { colorSpace: 'srgb', wrap: 'repeat', repeat: [10, 10] },
  },
  'test.tiles.displacement-repeat-10': {
    id: 'test.tiles.displacement-repeat-10',
    label: 'Tiles 位移图（重复 10 次）',
    kind: 'texture',
    url: assetUrls.tiles.displacement,
    scene: 'test',
    residency: 'critical',
    texture: { colorSpace: 'linear', wrap: 'repeat', repeat: [10, 10] },
  },
  'test.tiles.normal': {
    id: 'test.tiles.normal',
    label: 'Tiles 法线图',
    kind: 'texture',
    url: assetUrls.tiles.normal,
    scene: 'test',
    residency: 'critical',
    texture: { colorSpace: 'linear' },
  },
  'test.tiles.roughness': {
    id: 'test.tiles.roughness',
    label: 'Tiles 粗糙度图',
    kind: 'texture',
    url: assetUrls.tiles.roughness,
    scene: 'test',
    residency: 'critical',
    texture: { colorSpace: 'linear' },
  },
  'test.metal.color': {
    id: 'test.metal.color',
    label: 'Metal 色彩图',
    kind: 'texture',
    url: assetUrls.metal.color,
    scene: 'test',
    residency: 'optional',
    texture: { colorSpace: 'srgb' },
  },
  'test.metal.displacement': {
    id: 'test.metal.displacement',
    label: 'Metal 位移图',
    kind: 'texture',
    url: assetUrls.metal.displacement,
    scene: 'test',
    residency: 'optional',
    texture: { colorSpace: 'linear' },
  },
  'test.metal.metalness': {
    id: 'test.metal.metalness',
    label: 'Metal 金属度图',
    kind: 'texture',
    url: assetUrls.metal.metalness,
    scene: 'test',
    residency: 'optional',
    texture: { colorSpace: 'linear' },
  },
  'test.metal.normal': {
    id: 'test.metal.normal',
    label: 'Metal 法线图',
    kind: 'texture',
    url: assetUrls.metal.normal,
    scene: 'test',
    residency: 'optional',
    texture: { colorSpace: 'linear' },
  },
  'test.metal.roughness': {
    id: 'test.metal.roughness',
    label: 'Metal 粗糙度图',
    kind: 'texture',
    url: assetUrls.metal.roughness,
    scene: 'test',
    residency: 'optional',
    texture: { colorSpace: 'linear' },
  },
} as const satisfies Record<string, AssetDefinition>

export type AssetId = keyof typeof assetCatalog

export function getAsset(assetId: AssetId): AssetDefinition {
  return assetCatalog[assetId]
}

export function getStartupAssets(): AssetDefinition[] {
  return Object.values(assetCatalog).filter((asset) => asset.residency === 'startup')
}

export function getSceneAssets(sceneId: SceneId, residency?: AssetResidency): AssetDefinition[] {
  return Object.values(assetCatalog).filter(
    (asset) => asset.scene === sceneId && (!residency || asset.residency === residency),
  )
}
