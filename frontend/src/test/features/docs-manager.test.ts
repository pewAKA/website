import { beforeEach, describe, expect, it } from 'vitest'
import { getSafeCallbackUrl } from '@/lib/auth/safe-callback'
import {
  clearRecoveryDraft,
  isRecoveryNewer,
  readRecoveryDraft,
  writeRecoveryDraft,
} from '@/features/DocsManager/recovery'

describe('文档工作台安全与恢复', () => {
  beforeEach(() => window.localStorage.clear())

  it('只接受站内 callbackURL', () => {
    expect(getSafeCallbackUrl('/articles/manage/12?from=login')).toBe(
      '/articles/manage/12?from=login',
    )
    expect(getSafeCallbackUrl('https://evil.example/path')).toBe('/articles/manage')
    expect(getSafeCallbackUrl('//evil.example/path')).toBe('/articles/manage')
    expect(getSafeCallbackUrl('/admin/login')).toBe('/articles/manage')
  })

  it('写入、判断并清理本地恢复副本', () => {
    writeRecoveryDraft('12', { title: '未保存标题', content: '## 本地正文' })
    const draft = readRecoveryDraft('12')
    expect(draft?.payload.title).toBe('未保存标题')
    expect(isRecoveryNewer(draft!, '2020-01-01T00:00:00.000Z')).toBe(true)
    clearRecoveryDraft('12')
    expect(readRecoveryDraft('12')).toBeUndefined()
  })
})
