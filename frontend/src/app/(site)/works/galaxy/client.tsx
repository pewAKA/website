'use client'

import dynamic from 'next/dynamic'

const GalaxyScene = dynamic(() => import('@/features/Works/galaxy'), {
  ssr: false,
  loading: () => <main className="page-state">正在载入星系场景…</main>,
})

export default function GalaxyClient() {
  return <GalaxyScene />
}
