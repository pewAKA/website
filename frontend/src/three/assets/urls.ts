/** Three.js 运行时资源统一从 public 目录读取，构建后路径保持稳定。 */
export const assetUrls = {
  homeHero: '/hero.png',
  environments: {
    historicCloister: '/threejs/envMap/historic_cloister_passage_2k.hdr',
    monochromeStudio: '/threejs/envMap/monochrome_studio_02_1k.hdr',
  },
  fonts: {
    georgia: '/threejs/fonts/GEORGIA.json',
  },
  matcaps: {
    softClay: '/threejs/matcap/80726C_DCDBD7_9AA6C2_B7BFCA-64px.png',
  },
  tiles: {
    color: '/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Color.jpg',
    displacement: '/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Displacement.jpg',
    normal: '/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_NormalGL.jpg',
    roughness: '/threejs/textures/Tiles141_1K-JPG/Tiles141_1K-JPG_Roughness.jpg',
  },
  metal: {
    color: '/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Color.jpg',
    displacement: '/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Displacement.jpg',
    metalness: '/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Metalness.jpg',
    normal: '/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_NormalGL.jpg',
    roughness: '/threejs/textures/Metal049A_1K-JPG/Metal049A_1K-JPG_Roughness.jpg',
  },
  starParticleTexture: {
    map: '/threejs/particle/star_07.png',
  },
} as const
