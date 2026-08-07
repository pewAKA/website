import type { Metadata } from 'next'
import About from '@/features/About'

export const metadata: Metadata = {
  title: '关于我',
  description: '了解 Lynco Hub 的技术方向、能力与协作方式。',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return <About />
}
