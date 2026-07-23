import { Outlet } from 'react-router'
import FloatingNav from '@/components/FloatingNav'
import gsap from 'gsap'
import { ScrollTrigger, TextPlugin } from 'gsap/all'
import './App.scss'

gsap.registerPlugin(ScrollTrigger, TextPlugin)

function App() {
  return (
    <main className="app-shell">
      <FloatingNav />
      <Outlet />
    </main>
  )
}

export default App
