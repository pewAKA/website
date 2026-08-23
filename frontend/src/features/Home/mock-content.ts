/**
 * 首页模拟内容仅用于预览未来实验日志和文章数据的排版密度。
 * 接入真实内容服务后，可以直接替换这两个数组，不影响页面结构。
 */
export const mockLabNotes = [
  {
    date: '2026-08-19',
    displayDate: '08.19',
    project: 'Galaxy Systems',
    href: '/works/galaxy',
    title: '重新分配星系中心的粒子密度',
    summary: '固定随机种子后，继续调整旋臂扩散，让每次进入实验都得到同一幅结构。',
  },
  {
    date: '2026-08-14',
    displayDate: '08.14',
    project: 'Wave Shader',
    href: '/works/waves',
    title: '减少高细分平面的视觉噪声',
    summary: '收窄位移频率与速度，让明暗变化先建立材质，再表现动态。',
  },
  {
    date: '2026-08-08',
    displayDate: '08.08',
    project: 'Scroll Narrative',
    href: '/works/scroll',
    title: '把滚动状态限制在章节边界',
    summary: '只在章节进入视口时更新场景状态，避免每一帧滚动都触发 React 渲染。',
  },
  {
    date: '2026-07-31',
    displayDate: '07.31',
    project: 'Rendering System',
    href: '/works',
    title: '为 WebGL 中断保留静态画面',
    summary: 'Canvas 尚未就绪或上下文丢失时，继续显示项目海报与恢复入口。',
  },
] as const
