import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { serverConfig } from '@/server/config'
import * as schema from './schema'

type DatabaseGlobals = typeof globalThis & {
  __lyncoMySqlPool?: mysql.Pool
}

const databaseGlobals = globalThis as DatabaseGlobals

/** 开发热更新时复用连接池，避免重复打开大量 MySQL 连接。 */
export const pool =
  databaseGlobals.__lyncoMySqlPool ??
  mysql.createPool({
    uri: serverConfig.databaseUrl,
    connectionLimit: 10,
    timezone: '+08:00',
    enableKeepAlive: true,
  })

if (!serverConfig.production) databaseGlobals.__lyncoMySqlPool = pool

export const db = drizzle(pool, { schema, mode: 'default' })
export type Database = typeof db
