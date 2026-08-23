'use client'

import { Canvas, useThree } from '@react-three/fiber'
import Image from 'next/image'
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import './index.scss'

type ExperimentCanvasProps = {
  posterSrc: string
  posterAlt: string
  camera?: ComponentProps<typeof Canvas>['camera']
  children: ReactNode
}

function ContextMonitor({ onLost }: { onLost: () => void }) {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const handleLost = (event: Event) => {
      event.preventDefault()
      onLost()
    }

    canvas.addEventListener('webglcontextlost', handleLost)
    return () => canvas.removeEventListener('webglcontextlost', handleLost)
  }, [gl, onLost])

  return null
}

export default function ExperimentCanvas({
  posterSrc,
  posterAlt,
  camera,
  children,
}: ExperimentCanvasProps) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className={`experiment-canvas${ready && !failed ? ' is-ready' : ''}`}>
      <Image className="experiment-canvas__poster" src={posterSrc} alt={posterAlt} fill priority />
      {!failed && (
        <div className="experiment-canvas__webgl">
          <Canvas
            camera={camera}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0)
              gl.domElement.setAttribute('aria-hidden', 'true')
              setReady(true)
            }}
          >
            <ContextMonitor onLost={() => setFailed(true)} />
            {children}
          </Canvas>
        </div>
      )}

      {!ready && !failed && <p className="experiment-canvas__status">正在准备实时场景</p>}
      {failed && (
        <div className="experiment-canvas__failure" role="status">
          <p>实时场景已暂停，当前显示静态海报。</p>
          <button type="button" onClick={() => window.location.reload()}>
            重新载入
          </button>
        </div>
      )}
    </div>
  )
}
