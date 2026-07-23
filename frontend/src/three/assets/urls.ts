/**
 * 资源地址统一使用静态 new URL 写法，确保 Vite 在生产构建时生成可部署的资源路径。
 */
export const assetUrls = {
  homeHero: new URL('../../assets/hero.png', import.meta.url).href,
  environments: {
    historicCloister: new URL(
      '../../assets/threejs/envMap/historic_cloister_passage_2k.hdr',
      import.meta.url,
    ).href,
    monochromeStudio: new URL(
      '../../assets/threejs/envMap/monochrome_studio_02_1k.hdr',
      import.meta.url,
    ).href,
  },
  fonts: {
    georgia: new URL('../../assets/threejs/fonts/GEORGIA.json', import.meta.url).href,
  },
  matcaps: {
    softClay: new URL(
      '../../assets/threejs/matcap/80726C_DCDBD7_9AA6C2_B7BFCA-64px.png',
      import.meta.url,
    ).href,
  },
  tiles: {
    color: new URL(
      '../../assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Color.jpg',
      import.meta.url,
    ).href,
    displacement: new URL(
      '../../assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Displacement.jpg',
      import.meta.url,
    ).href,
    normal: new URL(
      '../../assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_NormalGL.jpg',
      import.meta.url,
    ).href,
    roughness: new URL(
      '../../assets/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Roughness.jpg',
      import.meta.url,
    ).href,
  },
  metal: {
    color: new URL(
      '../../assets/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Color.jpg',
      import.meta.url,
    ).href,
    displacement: new URL(
      '../../assets/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Displacement.jpg',
      import.meta.url,
    ).href,
    metalness: new URL(
      '../../assets/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Metalness.jpg',
      import.meta.url,
    ).href,
    normal: new URL(
      '../../assets/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_NormalGL.jpg',
      import.meta.url,
    ).href,
    roughness: new URL(
      '../../assets/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Roughness.jpg',
      import.meta.url,
    ).href,
  },
  starParticleTexture: {
    map: new URL('../../assets/threejs/particle/star_07.png', import.meta.url).href
  }
} as const
