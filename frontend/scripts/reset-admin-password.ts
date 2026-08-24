import { cancel, isCancel, password, text } from '@clack/prompts'
import { hashPassword } from 'better-auth/crypto'
import { and, eq } from 'drizzle-orm'
import { authAccounts, authSessions, authUsers } from '../src/server/db/schema/auth'
import { loadNextEnv } from './load-env'

// 与 Next.js 和迁移脚本使用同一份环境变量，避免重置到错误的数据库。
loadNextEnv()

function getPromptValue(value: string | symbol): string | undefined {
  if (isCancel(value)) {
    cancel('已取消，未修改任何账号。')
    return undefined
  }
  return value.trim()
}

const username = getPromptValue(
  await text({
    message: '管理员用户名',
    placeholder: 'admin',
    initialValue: 'admin',
    validate(value) {
      return value?.trim() ? undefined : '请输入用户名'
    },
  }),
)

const newPassword = getPromptValue(
  await password({
    message: '新密码（12–72 位）',
    validate(value) {
      return value && value.length >= 12 && value.length <= 72
        ? undefined
        : '密码长度需为 12–72 位'
    },
  }),
)

const confirmation = getPromptValue(await password({ message: '再次输入新密码' }))

if (!username || !newPassword || !confirmation) {
  process.exitCode = 0
} else if (newPassword !== confirmation) {
  console.error('两次输入的密码不一致，未修改任何账号。')
  process.exitCode = 1
} else {
  const { db, pool } = await import('../src/server/db/client')

  try {
    const [user] = await db
      .select({ id: authUsers.id, role: authUsers.role, banned: authUsers.banned })
      .from(authUsers)
      .where(eq(authUsers.username, username))
      .limit(1)

    if (!user || user.role !== 'admin') {
      throw new Error(`未找到用户名为“${username}”的管理员账号`)
    }
    if (user.banned) throw new Error('该管理员已被封禁，请先解除封禁后再重置密码')

    // 必须复用 Better Auth 的哈希实现，不能手写或直接保存明文密码。
    const passwordHash = await hashPassword(newPassword)

    await db.transaction(async (transaction) => {
      const [credentialAccount] = await transaction
        .select({ id: authAccounts.id })
        .from(authAccounts)
        .where(and(eq(authAccounts.userId, user.id), eq(authAccounts.providerId, 'credential')))
        .limit(1)

      if (credentialAccount) {
        await transaction
          .update(authAccounts)
          .set({ password: passwordHash, updatedAt: new Date() })
          .where(eq(authAccounts.id, credentialAccount.id))
      } else {
        await transaction.insert(authAccounts).values({
          id: crypto.randomUUID(),
          issuer: 'local:credential',
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: passwordHash,
        })
      }

      // 重置后让旧浏览器会话全部失效，下一次必须使用新密码登录。
      await transaction.delete(authSessions).where(eq(authSessions.userId, user.id))
    })

    console.log(`管理员“${username}”的密码已重置，请使用新密码重新登录。`)
  } finally {
    await pool.end()
  }
}
