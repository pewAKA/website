import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('执行业务表基线反向生成前必须设置 DATABASE_URL')
}

export default defineConfig({
  dialect: 'mysql',
  out: './drizzle/baseline',
  dbCredentials: { url: databaseUrl },
  tablesFilter: [
    'article',
    'article_category',
    'article_tag',
    'article_tag_relation',
    'sys_user',
  ],
  migrations: { table: '__drizzle_business_baseline__' },
  introspect: { casing: 'camel' },
  strict: true,
  verbose: true,
})
