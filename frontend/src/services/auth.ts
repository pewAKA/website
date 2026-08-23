import { authClient } from '@/lib/auth-client'
import type { ChangePasswordPayload } from '@/lib/articles/types'

function authError(error: { message?: string; code?: string } | null, fallback: string) {
  if (!error) return new Error(fallback)
  if (error.code?.includes('INVALID') || error.code?.includes('CREDENTIAL')) {
    return new Error('用户名或密码错误')
  }
  return new Error(error.message || fallback)
}

export async function login(username: string, password: string) {
  const result = await authClient.signIn.username({ username, password, rememberMe: false })
  if (result.error) throw authError(result.error, '登录失败，请稍后重试。')
  return result.data
}

export async function logout() {
  const result = await authClient.signOut()
  if (result.error) throw authError(result.error, '退出登录失败，请稍后重试。')
}

export async function changePassword(payload: ChangePasswordPayload) {
  const result = await authClient.changePassword({
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
    revokeOtherSessions: true,
  })
  if (result.error) throw authError(result.error, '密码未能更新，请稍后重试。')
  await logout()
}
