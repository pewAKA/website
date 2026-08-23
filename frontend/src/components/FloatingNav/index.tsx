'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import './index.scss'

const navItems = [
  { label: '作品', path: '/works' },
  { label: '文章', path: '/articles' },
  { label: '关于', path: '/about' },
]

function FloatingNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // 路由切换后自动收起菜单，避免展开面板遮挡新页面标题。
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 移动菜单打开后锁定页面滚动，并把键盘焦点限制在菜单内部。
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a, button') ?? []
    const firstItem = focusable[0]
    const lastItem = focusable[focusable.length - 1]

    document.body.style.overflow = 'hidden'
    firstItem?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }

      if (event.key !== 'Tab' || focusable.length === 0) {
        return
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem?.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <header className={`site-header${open ? ' site-header--open' : ''}`}>
      <div className="site-header__bar">
        <Link className="site-header__brand" href="/" aria-label="Lynco Hub 首页">
          <span className="site-header__brand-mark">LH</span>
          <span>Lynco Hub</span>
        </Link>

        <nav className="site-header__desktop-nav" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.path}
              className={
                pathname === item.path || pathname.startsWith(`${item.path}/`) ? 'is-active' : ''
              }
              href={item.path}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          ref={toggleRef}
          className="site-header__toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? '关闭' : '菜单'}
        </button>
      </div>

      <div ref={menuRef} className="site-menu" id="site-menu" hidden={!open}>
        <nav aria-label="移动端主导航">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} onClick={() => setOpen(false)}>
              <span>{item.label}</span>
              <small>{item.path}</small>
            </Link>
          ))}
          <Link href="/roadmap" onClick={() => setOpen(false)}>
            <span>路线图</span>
            <small>/roadmap</small>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default FloatingNav
