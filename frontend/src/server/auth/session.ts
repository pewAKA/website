import 'server-only'
import { headers } from 'next/headers'
import { auth, type AdminSession } from './auth'
import { ApiError } from '@/server/http/errors'

export async function getAdminSession(requestHeaders?: Headers): Promise<AdminSession | undefined> {
  const session = await auth.api.getSession({ headers: requestHeaders ?? (await headers()) })
  if (!session || session.user.role !== 'admin' || session.user.banned) return undefined
  return session
}

/** 所有后台数据入口都必须调用此函数，页面重定向不构成授权。 */
export async function requireAdmin(requestHeaders?: Headers): Promise<AdminSession> {
  const session = await auth.api.getSession({ headers: requestHeaders ?? (await headers()) })
  if (!session) throw new ApiError(401, 'UNAUTHORIZED', '请先登录')
  if (session.user.role !== 'admin' || session.user.banned) {
    throw new ApiError(403, 'FORBIDDEN', '没有访问权限')
  }
  return session
}
