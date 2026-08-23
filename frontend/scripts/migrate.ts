import { migrate } from 'drizzle-orm/mysql2/migrator'

import { db, pool } from '../src/server/db/client'

try {
  // 生产环境只执行仓库内已经审查过的 SQL，禁止用 drizzle-kit push 猜测变更。
  await migrate(db, {
    migrationsFolder: './drizzle',
    migrationsTable: '__drizzle_migrations__',
  })
  console.log('数据库迁移执行完成')
} finally {
  await pool.end()
}
