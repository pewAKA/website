import { Outlet } from 'react-router'
import './App.scss'

function App() {
  return (
    <main className="app-shell">
      <Outlet />
    </main>
  )
}

export default App
