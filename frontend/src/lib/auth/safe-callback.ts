const DEFAULT_CALLBACK = '/articles/manage'

/** 只允许站内绝对路径，阻止 callbackURL 被用于开放重定向。 */
export function getSafeCallbackUrl(value: string | null | undefined) {
  if (!value?.startsWith('/') || value.startsWith('//')) return DEFAULT_CALLBACK
  try {
    const base = 'https://lynco.internal'
    const url = new URL(value, base)
    if (url.origin !== base || url.pathname === '/admin/login') return DEFAULT_CALLBACK
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_CALLBACK
  }
}
