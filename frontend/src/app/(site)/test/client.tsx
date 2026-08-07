'use client'

import dynamic from 'next/dynamic'

const TestScene = dynamic(() => import('@/features/Test'), {
  ssr: false,
  loading: () => <main className="page-state">正在载入交互实验…</main>,
})

export default function TestClient() {
  return <TestScene />
}
