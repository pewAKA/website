'use client'

import dynamic from 'next/dynamic'

const ScrollScene = dynamic(() => import('@/features/Works/scrollTriger'), {
  ssr: false,
  loading: () => <main className="page-state">正在载入滚动场景…</main>,
})

export default function ScrollClient() {
  return <ScrollScene />
}
