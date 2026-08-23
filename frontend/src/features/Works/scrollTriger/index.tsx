'use client'

import { useEffect, useRef, useState } from 'react'
import ExperimentCanvas from '@/components/ExperimentCanvas'
import ExperimentFrame from '@/components/ExperimentFrame'
import Scene from './Scene'
import styles from './index.module.scss'

const story = [
  {
    title: '形态进入视野。',
    description: '第一个物体建立空间尺度，让页面从平面过渡到场景。',
  },
  {
    title: '滚动改变镜头。',
    description: '内容推进时，几何形态与相机节奏保持在同一条时间线上。',
  },
  {
    title: '节奏连接空间。',
    description: '文字、光线和对象在最后一屏汇合，完成一次短叙事。',
  },
]

export default function ScrollNarrativePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const storyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = storyRef.current
    if (!root) {
      return
    }

    const segments = Array.from(root.querySelectorAll<HTMLElement>('[data-story-segment]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (active) {
          setActiveIndex(Number((active.target as HTMLElement).dataset.storySegment ?? 0))
        }
      },
      { root, threshold: [0.55, 0.75] },
    )

    segments.forEach((segment) => observer.observe(segment))
    return () => observer.disconnect()
  }, [])

  return (
    <ExperimentFrame
      title="Scroll Narrative"
      description="可见段落驱动三维对象的位移与旋转，不在滚动帧中更新 React 状态。"
      technologies={['IntersectionObserver', 'Three.js', 'R3F']}
    >
      <ExperimentCanvas
        posterSrc="/works/scroll.webp"
        posterAlt="三件几何造物组成的滚动叙事实验海报"
        camera={{ position: [0, 0, 7], fov: 44, near: 0.1, far: 50 }}
      >
        <Scene activeIndex={activeIndex} />
      </ExperimentCanvas>
      <div className={styles.story} ref={storyRef} role="region" aria-label="滚动叙事内容">
        {story.map((item, index) => (
          <section className={styles.segment} data-story-segment={index} key={item.title}>
            <div className={index % 2 === 0 ? styles.copyLeft : styles.copyRight}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </section>
        ))}
      </div>
    </ExperimentFrame>
  )
}
