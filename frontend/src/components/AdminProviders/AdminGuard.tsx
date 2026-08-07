'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminToken } from '@/services/request'

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!getAdminToken()) {
      setAuthorized(false)
      router.replace('/admin/login')
      return
    }
    setAuthorized(true)
  }, [router])

  if (authorized !== true) {
    return <main className="admin-page admin-page__state">正在验证管理会话…</main>
  }
  return children
}
