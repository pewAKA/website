'use client'

import dynamic from 'next/dynamic'

const WavesScene = dynamic(() => import('@/features/Works/waves'), {
  ssr: false,
  loading: () => <main className="page-state">正在载入波浪场景…</main>,
})

export default function WavesClient() {
  return <WavesScene />
}
