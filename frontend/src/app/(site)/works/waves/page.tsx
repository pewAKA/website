import type { Metadata } from 'next'
import WavesClient from './client'

export const metadata: Metadata = { title: '波浪实验', robots: { index: false, follow: false } }

export default function WavesPage() {
  return <WavesClient />
}
