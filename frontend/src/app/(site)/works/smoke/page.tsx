import type { Metadata } from 'next'
import SmokeClient from './client'

export const metadata: Metadata = { title: '烟雾实验', robots: { index: false, follow: false } }

export default function SmokePage() {
  return <SmokeClient />
}
