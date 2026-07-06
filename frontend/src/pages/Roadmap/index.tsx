import HubSection, { type HubSectionCard } from '@/pages/HubSection'

const roadmapCards: HubSectionCard[] = [
  {
    meta: '内容扩展',
    title: '真实内容接入',
    description: '把项目、文章和个人信息从静态模板升级为可维护的数据源。',
  },
  {
    meta: '体验扩展',
    title: '三维与动效',
    description: '基于现有 R3F 依赖探索更有识别度的首屏或项目展示方式。',
  },
  {
    meta: '系统扩展',
    title: '后台与接口',
    description: '为内容发布、草稿管理、访问统计和搜索能力预留演进空间。',
  },
]

function Roadmap() {
  return (
    <HubSection
      eyebrow="Future Roadmap"
      title="后续拓展"
      description="这一页保存后续演进方向，帮助 Lynco Hub 从静态作品集逐步成长为个人内容中枢。"
      cards={roadmapCards}
      footer="后续开发可以按优先级拆成内容、视觉、数据和部署四条线，避免一次性把复杂度堆满。"
    />
  )
}

export default Roadmap
