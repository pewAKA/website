import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminLogin } from '@/features/Admin'

export const metadata: Metadata = { title: '管理登录', robots: { index: false, follow: false } }

export default function AdminLoginPage() {
  return <Suspense fallback={<main className="admin-login">正在打开登录页…</main>}><AdminLogin /></Suspense>
}
