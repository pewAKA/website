import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import './index.scss'

type ThemeMode = 'light' | 'dark'

const navItems = [
  { label: '首页', path: '/' },
  { label: '项目作品', path: '/works' },
  { label: '技术文章', path: '/articles' },
  { label: '关于我', path: '/about' },
  { label: '后续拓展', path: '/roadmap' },
]

const themeStorageKey = 'lynco-hub-theme'

function getSystemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): ThemeMode {
  const storedTheme = window.localStorage.getItem(themeStorageKey)
  return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : getSystemTheme()
}

function FloatingNav() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const location = useLocation()

  // 将主题写到 html 属性上，和全局 CSS token 的明暗模式保持同步。
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  // 路由切换后自动收起菜单，避免展开面板遮挡新页面标题。
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // 展开状态下支持 Escape 收起，键盘用户不用移动焦点也能关闭菜单。
  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <nav className={`floating-nav${open ? ' floating-nav--open' : ''}`} aria-label="主导航">
      <div className="floating-nav__controls">
        <button
          className={`floating-nav__theme-toggle floating-nav__theme-toggle--${theme}`}
          type="button"
          aria-label={theme === 'dark' ? '切换为浅色模式' : '切换为夜间模式'}
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        >
          <span className="floating-nav__theme-icon" aria-hidden="true" />
        </button>
        <div className="floating-nav__bar">
          <span className="floating-nav__brand" aria-label="Lynco Hub">
            <span className="floating-nav__brand-mark">LH</span>
            <span className="floating-nav__brand-name">Lynco Hub</span>
          </span>
          <button
            className="floating-nav__toggle"
            type="button"
            aria-expanded={open}
            aria-controls="floating-nav-panel"
            aria-label={open ? '收起菜单' : '展开菜单'}
            onClick={() => setOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="floating-nav__panel" id="floating-nav-panel">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            className={({ isActive }) =>
              `floating-nav__link${isActive ? ' floating-nav__link--active' : ''}`
            }
            end={item.path === '/'}
            to={item.path}
            onClick={() => setOpen(false)}
          >
            <span>{item.label}</span>
            <small>{item.path}</small>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default FloatingNav
