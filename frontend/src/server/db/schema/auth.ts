import { sql } from 'drizzle-orm'
import {
  boolean,
  datetime,
  index,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

const createdAt = () =>
  datetime('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
const updatedAt = () =>
  datetime('updated_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)

export const authUsers = mysqlTable(
  'auth_user',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: varchar('image', { length: 500 }),
    username: varchar('username', { length: 64 }),
    role: varchar('role', { length: 32 }).notNull().default('user'),
    banned: boolean('banned').notNull().default(false),
    banReason: varchar('ban_reason', { length: 255 }),
    banExpires: datetime('ban_expires', { mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('uk_auth_user_email').on(table.email),
    uniqueIndex('uk_auth_user_username').on(table.username),
  ],
)

export const authSessions = mysqlTable(
  'auth_session',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: varchar('ip_address', { length: 64 }),
    userAgent: text('user_agent'),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    impersonatedBy: varchar('impersonated_by', { length: 36 }),
  },
  (table) => [
    uniqueIndex('uk_auth_session_token').on(table.token),
    index('idx_auth_session_user').on(table.userId),
  ],
)

export const authAccounts = mysqlTable(
  'auth_account',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    issuer: varchar('issuer', { length: 191 }).notNull(),
    accountId: varchar('account_id', { length: 255 }).notNull(),
    providerId: varchar('provider_id', { length: 64 }).notNull(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: datetime('access_token_expires_at', { mode: 'date' }),
    refreshTokenExpiresAt: datetime('refresh_token_expires_at', { mode: 'date' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('idx_auth_account_user').on(table.userId),
    uniqueIndex('uk_auth_account_issuer').on(table.issuer, table.accountId),
  ],
)

export const authVerifications = mysqlTable(
  'auth_verification',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: text('value').notNull(),
    expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('idx_auth_verification_identifier').on(table.identifier)],
)

export const authSchema = {
  user: authUsers,
  session: authSessions,
  account: authAccounts,
  verification: authVerifications,
}
