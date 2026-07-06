import HubSection, { type HubSectionCard } from '@/pages/HubSection'

const articleCards: HubSectionCard[] = [
  {
    meta: '专题模板',
    title: 'React 与 TypeScript',
    description: '记录组件设计、类型约束、状态管理和路由组织中的实践方法。',
  },
  {
    meta: '工程模板',
    title: '构建与质量',
    description: '整理 Vite、Sass、Lint、接口请求和发布流程相关的工程化笔记。',
  },
  {
    meta: '观察模板',
    title: '交互与可视化',
    description: '收纳 Three.js、R3F、动效节奏和信息展示方式的探索记录。',
  },
]

function Articles() {
  return (
    <HubSection
      eyebrow="Technical Notes"
      title="技术文章"
      description="把临时笔记整理成可复用的知识节点，让经验不只停留在项目提交记录里。"
      cards={articleCards}
      footer="后续可以按技术栈、主题和发布时间组织文章列表，并接入 Markdown 或内容管理方案。"
    />
  )
}

export default Articles
