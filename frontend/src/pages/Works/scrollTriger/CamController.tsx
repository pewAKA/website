import { useGSAP } from '@gsap/react'
import { useFrame, useThree } from '@react-three/fiber'
import { useContext, useEffect, useRef } from 'react'
import * as Three from 'three'
import gsap from 'gsap'
import { ScrollTargetContext } from './context'

export default function CamController() {
  const { camera } = useThree()
  const pointerX = useRef(0)
  const pointerY = useRef(0)

  const scrolltargetContext = useContext(ScrollTargetContext)

  //更新相机位置（视差）
  useFrame((_, delta) => {
    //鼠标位置归一化
    const positionX = (pointerX.current / window.innerWidth) * 2 - 1
    const positionY = -((pointerY.current / window.innerHeight) * 2 - 1)

    //目标位置
    const targetX = positionX * 0.2
    const targetY = positionY * 0.2

    camera.position.x = Three.MathUtils.damp(camera.position.x, targetX, 10, delta)
    camera.position.y = Three.MathUtils.damp(camera.position.y, targetY, 10, delta)
  })

  //监听鼠标位置
  useEffect(() => {
    const mouseEvent = (e: MouseEvent) => {
      pointerX.current = e.clientX
      pointerY.current = e.clientY
    }
    window.addEventListener('mousemove', mouseEvent)
    return () => {
      window.removeEventListener('mousemove', mouseEvent)
    }
  }, [camera])

  //滚动动画
  useGSAP(() => {
    const scrollElement = scrolltargetContext?.pageContainerRef.current
    const group = scrolltargetContext?.geoGroupRef.current
    if (!scrollElement || !group) return

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: scrollElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    })

    timeline.to(group.position, {
      y: 10,
      ease: 'power1.inOut',
    })

    timeline.to(group.position, {
      y: 20,
      ease: 'power1.inOut',
    })
  })
  return null
}
