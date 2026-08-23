import { defineConfig } from 'drizzle-kit'
import { loadNextEnv } from './scripts/load-env'

// Drizzle CLI 不会像 Next.js 一样自动读取 .env.local，本地运行时在这里补齐。
loadNextEnv()

if (!process.env.DATABASE_URL) {
  throw new Error('运行 Drizzle 命令前必须配置 DATABASE_URL')
}

export default defineConfig({
  dialect: 'mysql',
  // 既有业务表不参与 generate，防止工具误判并重建；这里只管理新增表。
  schema: ['./src/server/db/schema/auth.ts', './src/server/db/schema/documents.ts'],
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL },
  migrations: { table: '__drizzle_migrations__' },
  introspect: { casing: 'camel' },
  strict: true,
  verbose: true,
})
