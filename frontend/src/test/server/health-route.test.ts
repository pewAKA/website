import { describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/health/route'

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }))

vi.mock('@/server/db/client', () => ({ db: { execute } }))

describe('/api/health', () => {
  it('数据库正常时返回 200', async () => {
    execute.mockResolvedValueOnce([[]])
    const response = await GET()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: 'UP' })
  })

  it('数据库失败时返回 503 且不暴露异常', async () => {
    execute.mockRejectedValueOnce(new Error('secret database path'))
    const response = await GET()
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ status: 'DOWN' })
  })
})

