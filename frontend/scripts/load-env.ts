import * as nextEnvModule from '@next/env'

type NextEnvRuntime = {
  loadEnvConfig?: (directory: string) => unknown
  default?: { loadEnvConfig?: (directory: string) => unknown }
}

/** 兼容 drizzle-kit 的 CJS 加载方式与 tsx 的 ESM 加载方式。 */
export function loadNextEnv(directory = process.cwd()) {
  const runtime = nextEnvModule as unknown as NextEnvRuntime
  const loadEnvConfig = runtime.loadEnvConfig ?? runtime.default?.loadEnvConfig
  if (!loadEnvConfig) throw new Error('无法加载 Next.js 环境变量模块')
  loadEnvConfig(directory)
}
