import type { Metadata } from 'next'
import Roadmap from '@/features/Roadmap'

export const metadata: Metadata = {
  title: '后续拓展',
  description: 'Lynco Hub 在内容、视觉、数据与部署方向的演进计划。',
  alternates: { canonical: '/roadmap' },
}

export default function RoadmapPage() {
  return <Roadmap />
}
