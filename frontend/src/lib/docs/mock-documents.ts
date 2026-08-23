import type { DocumentCategory, DocumentRecord } from './types'

export const documentCategories: DocumentCategory[] = [
  {
    slug: 'frontend',
    name: '前端架构',
    description: '围绕 App Router、数据边界与长期可维护性的实现记录。',
    order: 1,
  },
  {
    slug: 'graphics',
    name: '实时图形',
    description: '记录粒子、Shader 和浏览器渲染预算中的具体判断。',
    order: 2,
  },
  {
    slug: 'interaction',
    name: '交互工程',
    description: '把滚动叙事、状态管理和验证策略整理成可复用方法。',
    order: 3,
  },
]

export const portalDocument: DocumentRecord = {
  id: 'docs-overview',
  slugs: [],
  title: '工程笔记',
  description: '从界面系统到实时图形，一组持续校正中的 Web 实践记录。',
  category: 'overview',
  tags: ['Index'],
  publishedAt: '2026-08-01T09:00:00+08:00',
  updatedAt: '2026-08-23T18:20:00+08:00',
  readingMinutes: 2,
  featured: false,
  content: 'Lynco Hub 技术文档索引。',
}

export const mockDocuments: DocumentRecord[] = [
  {
    id: 'server-component-boundaries',
    slugs: ['frontend', 'server-component-boundaries'],
    title: '把 Server Component 留在正确的边界里',
    description: '用一次文章页重构，说明数据读取、交互状态和客户端依赖应该在哪里分开。',
    category: 'frontend',
    tags: ['Next.js', 'React', 'RSC'],
    publishedAt: '2026-08-21T09:30:00+08:00',
    updatedAt: '2026-08-23T14:40:00+08:00',
    readingMinutes: 8,
    featured: true,
    coverImage: '/works/scroll.webp',
    content: String.raw`
## 问题不是组件数量，而是边界漂移

一个页面最初只有标题和正文，随后加入目录、收藏状态、搜索与埋点。如果所有能力都从顶层组件开始客户端化，数据获取会被迫进入 effect，首屏也会多一次等待。

<Callout type='info' title='判断原则'>
只有需要浏览器状态、事件监听或客户端 Context 的最小区域进入 Client Component。数据读取与正文编译继续留在服务端。
</Callout>

## 先画出数据流

文章详情的稳定路径只有三段：读取记录、编译内容、把少量交互交给客户端。页面组件不需要知道数据来自 Mock、数据库还是 CMS。

~~~tsx
export default async function ArticlePage({ params }: PageProps) {
  const page = await repository.findBySlugs((await params).slug)
  if (!page) notFound()

  const compiled = await compiler.compile({ source: page.content })
  return <ArticleDocument page={page} compiled={compiled} />
}
~~~

这种结构让 Repository 成为唯一可替换点，也让 metadata、搜索索引和正文使用同一份记录。

## Server 与 Client 的分工

<Tabs items={['Server', 'Client']}>
  <Tab value='Server'>
    读取内容、生成 metadata、编译 MDX、计算上一篇与下一篇。这些步骤不依赖浏览器，也不应该进入客户端 bundle。
  </Tab>
  <Tab value='Client'>
    搜索弹窗、代码复制、移动侧栏和 Tabs 状态。它们只接收渲染需要的最小数据。
  </Tab>
</Tabs>

## 避免把序列化当成实现细节

服务端与客户端之间的 props 必须可以序列化。不要把 Repository、编译器实例或带闭包的方法穿过边界。日期在跨边界前转成 ISO 字符串，展示时再格式化。

| 数据 | 保留位置 | 原因 |
| --- | --- | --- |
| Markdown 原文 | 服务端 | 内容较大且需要可信编译 |
| TOC 数组 | 服务端生成，客户端消费 | 体积小，目录交互需要 |
| 当前 slug | 两端都可用 | 路由与高亮共同依赖 |
| 复制状态 | 客户端 | 只与当前浏览器有关 |

## 重构后的检查表

1. 页面源代码里能直接看到正文，而不是等待 effect。
2. 禁用 JavaScript 后仍能阅读文章和使用普通链接。
3. 客户端组件没有直接导入 Node-only 模块。
4. Repository 更换实现时，页面文件不需要变化。

下一篇可以继续阅读[类型安全的内容契约](/articles/frontend/typed-content-contracts)，把这个边界延伸到数据结构。
`,
  },
  {
    id: 'typed-content-contracts',
    slugs: ['frontend', 'typed-content-contracts'],
    title: '给内容系统一份可演进的类型契约',
    description: '在 Mock、管理后台和未来 CMS 之间保留一个稳定、可验证的文档模型。',
    category: 'frontend',
    tags: ['TypeScript', 'Data model', 'CMS'],
    publishedAt: '2026-08-16T11:10:00+08:00',
    updatedAt: '2026-08-20T17:25:00+08:00',
    readingMinutes: 7,
    featured: false,
    content: String.raw`
## 内容模型需要比接口响应更稳定

直接把后端 DTO 带进页面很省事，但分类字段改名、分页结构调整或 CMS 更换时，视图会被迫一起变化。公开文档应该依赖自己的领域模型。

~~~ts
export type DocumentRecord = {
  id: string
  slugs: string[]
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  featured: boolean
  content: string
}
~~~

## Repository 隔离来源差异

Repository 不暴露分页响应、HTTP 状态码或数据库主键规则。页面只关心“列出文档”和“按路径找到文档”。

~~~ts
export interface DocumentRepository {
  list(): Promise<DocumentRecord[]>
  findBySlugs(slugs: string[]): Promise<DocumentRecord | undefined>
}
~~~

<Callout type='warn' title='不要提前抽象所有事情'>
接口只包含当前页面真正使用的两个读取能力。搜索、草稿预览和权限控制等到后端接回时再扩展。
</Callout>

## 字段的所有权

| 字段 | 由谁产生 | 页面如何使用 |
| --- | --- | --- |
| slugs | 内容源适配器 | 路由和唯一查找 |
| readingMinutes | 内容服务或适配器 | 元信息展示 |
| structuredData | 文档编译层 | 全文搜索，不进入业务 DTO |
| featured | 编辑策略 | 门户精选内容 |

## 在边界处验证，而不是到处防御

未来接入 API 时，在适配器入口完成结构验证与默认值补齐。通过验证后，组件可以相信 DocumentRecord，不必在每个标题旁边重复判断字符串是否存在。

~~~ts
function toDocumentRecord(input: ApiArticle): DocumentRecord {
  return {
    id: String(input.id),
    slugs: [input.category.slug, input.slug],
    title: input.title.trim(),
    description: input.summary.trim(),
    category: input.category.slug,
    tags: input.tags.map((tag) => tag.name),
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt,
    readingMinutes: estimateReadingTime(input.content),
    featured: false,
    content: input.content,
  }
}
~~~

## Mock 也应该遵守生产契约

高质量 Mock 不是另一套临时数据。它应覆盖长标题、多标签、不同日期、代码块和缺失封面等真实差异，才能在后端接入前暴露布局问题。
`,
  },
  {
    id: 'particle-frame-budget',
    slugs: ['graphics', 'particle-frame-budget'],
    title: '把 26,000 个粒子留在一帧里',
    description: '从 draw call、顶点更新到像素填充，拆解一个 WebGL 粒子场景的真实预算。',
    category: 'graphics',
    tags: ['Three.js', 'WebGL', 'Performance'],
    publishedAt: '2026-08-18T08:45:00+08:00',
    updatedAt: '2026-08-22T10:15:00+08:00',
    readingMinutes: 9,
    featured: true,
    coverImage: '/works/galaxy.webp',
    content: String.raw`
## 先定义帧预算

60 FPS 留给一帧的时间约为 16.7ms，但页面还有 React、布局、合成与浏览器自身工作。粒子系统不应该独占这段时间，桌面目标控制在 7ms 左右，移动设备则主动降低规模。

| 场景 | 粒子数量 | GPU 时间 | 处理策略 |
| --- | ---: | ---: | --- |
| 桌面独显 | 26,240 | 4.8ms | 保留全部层次 |
| 集成显卡 | 18,400 | 6.1ms | 降低像素密度 |
| 移动设备 | 9,600 | 7.4ms | 缩小点尺寸并关闭辉光 |

## 把静态数据留在 GPU

位置、随机种子和颜色偏移只在初始化时写入 BufferAttribute。每帧只更新时间 uniform，避免在 JavaScript 中遍历整个粒子数组。

~~~ts
const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

useFrame(({ clock }) => {
  material.uniforms.uTime.value = clock.getElapsedTime()
})
~~~

<Callout type='info' title='测量提示'>
React DevTools 看不到 GPU 瓶颈。先用 Performance 面板区分脚本、渲染和合成，再用浏览器 WebGL 工具确认 draw call 与纹理状态。
</Callout>

## 像素成本经常比顶点更贵

点精灵尺寸过大时，透明区域同样参与片元计算。粒子数量没有变化，GPU 时间却会随着覆盖面积快速上升。限制设备像素比通常比盲目减少顶点更有效。

~~~glsl
float strength = 1.0 - distance(gl_PointCoord, vec2(0.5)) * 2.0;
strength = pow(max(strength, 0.0), 3.0);
gl_FragColor = vec4(vColor, strength * 0.72);
~~~

## 分级，而不是二元降级

1. 根据 viewport 与 devicePixelRatio 计算初始质量级别。
2. 前 90 帧记录移动平均耗时。
3. 连续超预算时只降低一个档位。
4. prefers-reduced-motion 开启时停止自动旋转，但保留静态画面。

## 为失败准备一张仍然成立的画面

Canvas 初始化失败或上下文丢失时，展示项目海报、简短说明和重试入口。视觉实验可以失败，页面的信息结构不能一起消失。

继续阅读[Shader 位移调试](/articles/graphics/shader-displacement-debugging)，查看如何定位画面中的高频噪声。
`,
  },
  {
    id: 'shader-displacement-debugging',
    slugs: ['graphics', 'shader-displacement-debugging'],
    title: '顶点位移失控时，按什么顺序调试',
    description: '把“看起来不对”拆成坐标、频率、法线与时间四个可验证问题。',
    category: 'graphics',
    tags: ['GLSL', 'Shader', 'Debugging'],
    publishedAt: '2026-08-11T15:20:00+08:00',
    updatedAt: '2026-08-19T12:05:00+08:00',
    readingMinutes: 8,
    featured: false,
    coverImage: '/works/waves.webp',
    content: String.raw`
## 先去掉“漂亮”的部分

当噪声、光照、颜色和后期同时存在时，很难判断错误属于哪一层。调试的第一步是输出单一变量，让画面只回答一个问题。

~~~glsl
float elevation = snoise(vec3(position.xy * 0.42, uTime * 0.16));
vec3 displaced = position + normal * elevation * uStrength;
gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
~~~

## 四段式排查

1. **坐标**：确认噪声输入使用 local、world 还是 view space。
2. **频率**：把频率降到原来的四分之一，观察大形是否连续。
3. **振幅**：暂时使用固定值，排除音频或滚动输入抖动。
4. **时间**：冻结 uTime，确认问题来自空间还是动画。

<Callout type='warn' title='常见误判'>
网格细分不足会表现为硬折线，但继续提高噪声频率只会让折线更明显。先确认几何密度，再调整函数。
</Callout>

## 用颜色显示中间值

~~~glsl
float debugValue = elevation * 0.5 + 0.5;
gl_FragColor = vec4(vec3(debugValue), 1.0);
~~~

如果灰阶出现断层，问题在噪声或插值；如果灰阶连续但光照破碎，则应检查位移后的法线。

## 法线不应沿用旧几何

大幅顶点位移后，原始 normal 不再描述表面方向。低成本方案是缩小振幅并使用导数近似，高质量方案则在顶点阶段对邻近采样重新计算切线。

| 方案 | 成本 | 适用情况 |
| --- | ---: | --- |
| 保留原法线 | 低 | 位移轻微、材质粗糙 |
| 屏幕空间导数 | 中 | 片元足够、移动端谨慎使用 |
| 邻点重算法线 | 高 | 主视觉近景、轮廓变化明显 |

## 最后再恢复动画

恢复时间时使用稳定时钟，不要把滚动 delta 直接累加进 uniform。滚动只负责目标值，渲染循环负责平滑逼近，画面会更容易复现和测试。
`,
  },
  {
    id: 'scroll-section-state-machine',
    slugs: ['interaction', 'scroll-section-state-machine'],
    title: '把滚动叙事限制在章节状态机里',
    description: '避免每一个滚动像素都驱动 React，让章节切换成为可追踪、可恢复的状态。',
    category: 'interaction',
    tags: ['GSAP', 'State machine', 'Accessibility'],
    publishedAt: '2026-08-08T10:00:00+08:00',
    updatedAt: '2026-08-17T19:30:00+08:00',
    readingMinutes: 7,
    featured: true,
    coverImage: '/works/scroll.webp',
    content: String.raw`
## 滚动位置不是业务状态

scrollY 是连续且高频的输入，章节却是离散状态。把二者直接绑定，会让 React 在每一帧更新，也会让刷新恢复、键盘导航和深链接变得困难。

~~~ts
type Chapter = 'intro' | 'material' | 'motion' | 'outro'

type NarrativeState = {
  active: Chapter
  progress: number
  direction: 1 | -1
}
~~~

## Observer 只负责判定章节

IntersectionObserver 记录哪个章节进入有效区域，渲染循环再读取目标章节。这样 React 只在章节变化时更新，章节内部的连续动画留给 GSAP 或 Three.js。

~~~ts
const observer = new IntersectionObserver(onEntries, {
  rootMargin: '-32% 0px -46% 0px',
  threshold: [0, 0.25, 0.6],
})
~~~

<Callout type='info' title='边界比中心点更可靠'>
不同高度的章节很难共享一个“屏幕中心即激活”规则。使用带上下留白的有效区域，切换会更稳定。
</Callout>

## 章节切换需要可逆

| 事件 | 状态变化 | 场景行为 |
| --- | --- | --- |
| intro → material | 激活材质章节 | 相机靠近，显示网格细节 |
| material → motion | 激活动态章节 | 启用位移，降低说明文字透明度 |
| motion → material | 返回上一章节 | 反向播放，不重建场景 |
| 任意 → outro | 进入总结 | 停止自动旋转，释放输入 |

## 无动画偏好不是“什么都不显示”

prefers-reduced-motion 开启时，章节内容仍需完整可读。关闭视差和惯性，把场景切换改成短暂淡入，保留当前章节的静态构图。

## 刷新和深链接

每个章节使用真实 id。首次加载时先读取 location.hash，再滚动到对应章节并同步场景状态。URL 是恢复入口，不应该只是装饰性的锚点。

## 退出时清理所有权

路由离开后销毁 Observer、ScrollTrigger 和 RAF 订阅。尤其要确保开发模式重复挂载时不会留下第二套监听器，否则性能问题只会在热更新后出现。
`,
  },
  {
    id: 'testing-next-routes',
    slugs: ['interaction', 'testing-next-routes'],
    title: '给 Next.js 页面安排三层测试',
    description: '让数据适配、服务端页面与浏览器交互各自承担适合自己的验证成本。',
    category: 'interaction',
    tags: ['Vitest', 'Next.js', 'Testing'],
    publishedAt: '2026-07-29T13:40:00+08:00',
    updatedAt: '2026-08-15T09:50:00+08:00',
    readingMinutes: 8,
    featured: false,
    content: String.raw`
## 不要让所有问题都进入端到端测试

页面测试慢，失败信息也更远。一个稳定的组合是：纯函数覆盖数据规则，组件测试覆盖可访问输出，浏览器测试只验证真实路由与交互链路。

<Tabs items={['数据层', '页面层', '浏览器']}>
  <Tab value='数据层'>验证 slug 唯一性、排序、缺失记录和 API 到领域模型的转换。</Tab>
  <Tab value='页面层'>验证 metadata、404、目录输入和关键语义结构。</Tab>
  <Tab value='浏览器'>验证搜索弹窗、移动侧栏、锚点滚动与代码复制。</Tab>
</Tabs>

## 第一层：Repository 契约

~~~ts
it('按更新时间返回最近文档', async () => {
  const documents = await repository.list()
  const recent = [...documents].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )

  expect(recent[0].slugs).toEqual(['frontend', 'server-component-boundaries'])
})
~~~

这类测试不渲染 React，能快速定位内容源问题。Mock 与未来 API Repository 应共享同一组契约测试。

## 第二层：服务端页面输入输出

测试页面时不要复刻 Next.js 内部实现。关注给定 slug 后是否选择正确文档、是否生成 canonical URL，以及缺失记录是否进入 notFound。

| 场景 | 断言 |
| --- | --- |
| 门户首页 | 分类和最近更新都存在 |
| 合法详情 | 标题、摘要、TOC 与正文出现 |
| 未知 slug | 返回 404 |
| 重复标题 | TOC id 保持唯一 |

## 第三层：真实浏览器

只保留需要布局、焦点或浏览器 API 的路径：Ctrl/Cmd + K 打开搜索，Esc 关闭；侧栏在窄屏可展开；点击目录后标题不被固定栏遮挡；复制按钮写入剪贴板。

<Callout type='warn' title='构建也是测试'>
MDX 编译、Server Component 边界和 Route Handler 经常只有在 production build 中暴露问题。typecheck 通过不等于 next build 可以省略。
</Callout>

## 让失败指向所属层

如果排序错误，失败应停在 Repository；如果标题缺失，失败应停在页面测试；如果焦点逃出弹窗，才进入浏览器测试。越靠近问题的测试，维护成本越低。
`,
  },
]
