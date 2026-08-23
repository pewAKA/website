const isBuildOrTest =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test'

function required(name: string, buildFallback: string) {
  const value = process.env[name]?.trim()
  if (value) return value
  if (isBuildOrTest) return buildFallback
  throw new Error(`缺少必需环境变量 ${name}`)
}

export const serverConfig = {
  databaseUrl: required(
    'DATABASE_URL',
    'mysql://build_only:build_only@127.0.0.1:3306/build_only',
  ),
  authSecret: required(
    'BETTER_AUTH_SECRET',
    'build-or-test-only-secret-must-not-be-used-in-production',
  ),
  authUrl: process.env.BETTER_AUTH_URL || process.env.SITE_URL || 'http://localhost:3000',
  mediaRoot: process.env.MEDIA_ROOT || './uploads',
  mediaPublicPath: (process.env.MEDIA_PUBLIC_PATH || '/media').replace(/\/+$/, ''),
  production: process.env.NODE_ENV === 'production',
} as const
