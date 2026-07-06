import { Outlet } from 'react-router'
import FloatingNav from '@/components/FloatingNav'
import './App.scss'

function App() {
  return (
    <main className="app-shell">
      <FloatingNav />
      <Outlet />
    </main>
  )
}

export default App
