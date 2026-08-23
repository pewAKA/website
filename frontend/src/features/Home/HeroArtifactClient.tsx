'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState } from 'react'

const HeroArtifactScene = dynamic(() => import('./HeroArtifactScene'), {
  ssr: false,
  loading: () => null,
})

export default function HeroArtifactClient() {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className={`hero-artifact${ready && !failed ? ' is-ready' : ''}`}>
      <Image
        className="hero-artifact__poster"
        src="/hero-artifact.webp"
        alt="由金属核心与轨道组成的抽象数字造物"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 54vw"
      />
      <div className="hero-artifact__canvas" aria-hidden="true">
        <HeroArtifactScene
          onContextLost={() => setFailed(true)}
          onReady={() => {
            setReady(true)
            setFailed(false)
          }}
        />
      </div>
      {failed && (
        <p className="hero-artifact__status" role="status">
          当前设备使用静态画面展示主视觉。
        </p>
      )}
    </div>
  )
}
