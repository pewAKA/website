import type { Metadata } from 'next'
import TestClient from './client'

export const metadata: Metadata = { title: '交互实验', robots: { index: false, follow: false } }

export default function TestPage() {
  return <TestClient />
}
