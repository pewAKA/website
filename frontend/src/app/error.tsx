'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="page-state">
      <p>页面暂时无法加载，请稍后重试。</p>
      <button type="button" onClick={reset}>
        重新加载
      </button>
    </main>
  )
}
