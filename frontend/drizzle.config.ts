import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  throw new Error('运行 Drizzle 命令前必须配置 DATABASE_URL')
}

export default defineConfig({
  dialect: 'mysql',
  schema: './src/server/db/schema/auth.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL },
  migrations: { table: '__drizzle_migrations__' },
  introspect: { casing: 'camel' },
  strict: true,
  verbose: true,
})
