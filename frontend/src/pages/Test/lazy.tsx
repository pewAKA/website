import { lazy } from 'react'

// 场景组件独立导出，避免路由模块将 Three.js 依赖纳入首屏。
const TestPage = lazy(() => import('./index'))

export default TestPage
