import { describe, expect, it, vi } from 'vitest'
import { getAdminSession, requireAdmin } from '@/server/auth/session'

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }))
vi.mock('@/server/auth/auth', () => ({ auth: { api: { getSession } } }))

const adminSession = {
  session: { id: 'session-1' },
  user: { id: 'user-1', role: 'admin', banned: false },
}

describe('后台 Session 授权', () => {
  it('未登录返回 401', async () => {
    getSession.mockResolvedValueOnce(null)
    await expect(requireAdmin(new Headers())).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })

  it('普通角色和封禁管理员返回 403', async () => {
    getSession.mockResolvedValueOnce({ ...adminSession, user: { ...adminSession.user, role: 'user' } })
    await expect(requireAdmin(new Headers())).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' })

    getSession.mockResolvedValueOnce({ ...adminSession, user: { ...adminSession.user, banned: true } })
    await expect(requireAdmin(new Headers())).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' })
  })

  it('仅返回有效管理员 Session', async () => {
    getSession.mockResolvedValueOnce(adminSession)
    await expect(getAdminSession(new Headers())).resolves.toEqual(adminSession)
  })
})

