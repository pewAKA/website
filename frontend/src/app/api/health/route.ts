import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/server/db/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      db.execute(sql`SELECT 1`),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('database timeout')), 2_000)
      }),
    ])
    return NextResponse.json({ status: 'UP' })
  } catch (error) {
    console.error('数据库健康检查失败', error)
    return NextResponse.json({ status: 'DOWN' }, { status: 503 })
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
