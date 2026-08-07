'use client'

import dynamic from 'next/dynamic'

const SmokeScene = dynamic(() => import('@/features/Works/smoke'), {
  ssr: false,
  loading: () => <main className="page-state">正在载入烟雾场景…</main>,
})

export default function SmokeClient() {
  return <SmokeScene />
}
