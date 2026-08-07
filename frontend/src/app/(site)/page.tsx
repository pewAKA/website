import type { Metadata } from 'next'
import Home from '@/features/Home'

export const metadata: Metadata = {
  title: '首页',
  description: 'Lynco Hub 的项目作品、技术文章和个人内容入口。',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return <Home />
}
