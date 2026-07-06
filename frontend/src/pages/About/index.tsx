import HubSection, { type HubSectionCard } from '@/pages/HubSection'

const aboutCards: HubSectionCard[] = [
  {
    meta: '身份模板',
    title: '当前定位',
    description: '介绍关注的技术方向、擅长解决的问题，以及正在建立的个人作品体系。',
  },
  {
    meta: '技能模板',
    title: '能力坐标',
    description: '展示前端工程、交互实现、接口协作和视觉还原等能力模块。',
  },
  {
    meta: '联系模板',
    title: '协作入口',
    description: '预留邮箱、社交主页、简历下载或其他适合公开展示的联系方式。',
  },
]

function About() {
  return (
    <HubSection
      eyebrow="About Lynco"
      title="关于我"
      description="这里是 Lynco Hub 的个人侧写页，用更克制的方式说明经历、能力和正在关注的方向。"
      cards={aboutCards}
      footer="当前只放结构模板，后续补充真实履历时可以继续加入时间线、技能标签和外部链接。"
    />
  )
}

export default About
