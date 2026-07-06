import HubSection, { type HubSectionCard } from '@/pages/HubSection'

// 页面模板数据先保持静态，后续可以替换为真实项目列表或接口数据。
const workCards: HubSectionCard[] = [
  {
    meta: '作品模板',
    title: '产品与工具',
    description: '用于展示完整项目：背景、目标、技术选型、核心截图与上线状态。',
  },
  {
    meta: '复盘模板',
    title: '迭代记录',
    description: '保留项目过程里的关键决策、踩坑修正和下一轮优化方向。',
  },
  {
    meta: '实验模板',
    title: '交互试验',
    description: '给 3D、动画、可视化和小工具留出轻量展示位。',
  },
]

function Works() {
  return (
    <HubSection
      eyebrow="Project Works"
      title="项目作品"
      description="这里会沉淀 Lynco Hub 的项目样本：既放成熟作品，也放还在打磨的技术实验。"
      cards={workCards}
      footer="模板阶段先保留清晰的信息层级，等真实项目进入后，可以继续扩展筛选、标签和详情页。"
    />
  )
}

export default Works
