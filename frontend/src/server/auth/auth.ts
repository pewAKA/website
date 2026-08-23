import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { admin, username } from 'better-auth/plugins'
import { serverConfig } from '@/server/config'
import { db } from '@/server/db/client'
import { authSchema } from '@/server/db/schema/auth'

export const auth = betterAuth({
  appName: 'Lynco Hub',
  baseURL: serverConfig.authUrl,
  basePath: '/api/auth',
  secret: serverConfig.authSecret,
  database: drizzleAdapter(db, { provider: 'mysql', schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 72,
  },
  session: {
    expiresIn: 60 * 60 * 12,
    disableSessionRefresh: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/username': { window: 60, max: 5 },
    },
  },
  advanced: {
    cookiePrefix: 'lynco-hub',
    useSecureCookies: serverConfig.production,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: serverConfig.production,
      sameSite: 'lax',
      path: '/',
    },
  },
  disabledPaths: ['/sign-up/email', '/is-username-available'],
  plugins: [
    username({ immutableUsername: true, displayUsername: false, maxUsernameLength: 64 }),
    admin({ defaultRole: 'user', adminRoles: ['admin'] }),
  ],
})

export type AdminSession = typeof auth.$Infer.Session
