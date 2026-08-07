import type { Metadata } from 'next'
import ScrollClient from './client'

export const metadata: Metadata = { title: '滚动实验', robots: { index: false, follow: false } }

export default function ScrollPage() {
  return <ScrollClient />
}
