import type { Metadata } from 'next'
import Works from '@/features/Works'

export const metadata: Metadata = {
  title: '项目作品',
  description: 'Lynco Hub 的项目、工具与交互实验。',
  alternates: { canonical: '/works' },
}

export default function WorksPage() {
  return <Works />
}
