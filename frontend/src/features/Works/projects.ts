export type ProjectEntry = {
  slug: string
  title: string
  description: string
  year: number
  category: 'shader' | 'particles' | 'scroll'
  status: 'live' | 'lab'
  href: string
  posterSrc: string
  technologies: string[]
  sceneTheme: 'light' | 'dark'
  focus: string
  scale: string
  constraint: string
  nextIteration: string
}

export const projects = [
  {
    slug: 'galaxy',
    title: 'Galaxy Systems',
    description: '用程序化粒子、色彩插值与空间旋转构建一座可实时观察的星系。',
    year: 2026,
    category: 'particles',
    status: 'lab',
    href: '/works/galaxy',
    posterSrc: '/works/galaxy.webp',
    technologies: ['Three.js', 'R3F', 'BufferGeometry'],
    sceneTheme: 'dark',
    focus: '分层密度与慢速自转',
    scale: '26,000 个程序化粒子',
    constraint: '低 DPR 设备的填充率',
    nextIteration: '不增加后处理，继续强化远近层次。',
  },
  {
    slug: 'waves',
    title: 'Wave Shader',
    description: '把顶点位移、时间和材质明暗组合成一片持续变化的数字波面。',
    year: 2026,
    category: 'shader',
    status: 'lab',
    href: '/works/waves',
    posterSrc: '/works/waves.webp',
    technologies: ['GLSL', 'ShaderMaterial', 'R3F'],
    sceneTheme: 'dark',
    focus: '顶点位移与材质明暗',
    scale: '256 x 256 网格分段',
    constraint: '高细分平面的帧率抖动',
    nextIteration: '加入指针扰动，同时保留低动态模式。',
  },
  {
    slug: 'scroll',
    title: 'Scroll Narrative',
    description: '让滚动成为镜头语言，在同一个三维空间中串联形态、文字和节奏。',
    year: 2026,
    category: 'scroll',
    status: 'lab',
    href: '/works/scroll',
    posterSrc: '/works/scroll.webp',
    technologies: ['IntersectionObserver', 'Three.js', 'React'],
    sceneTheme: 'dark',
    focus: '章节进入与镜头过渡',
    scale: '3 个叙事段落',
    constraint: '滚动过程中的 React 更新边界',
    nextIteration: '补齐移动端段落长度与触控节奏。',
  },
] as const satisfies readonly ProjectEntry[]

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}
