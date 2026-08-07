import type { Metadata } from 'next'
import GalaxyClient from './client'

export const metadata: Metadata = { title: '星系实验', robots: { index: false, follow: false } }

export default function GalaxyPage() {
  return <GalaxyClient />
}
