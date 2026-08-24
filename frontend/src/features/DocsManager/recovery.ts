import type { ArticlePayload } from '@/lib/articles/types'

export type RecoveryDraft = {
  savedAt: string
  payload: Partial<ArticlePayload>
}

export function recoveryKey(id?: string) {
  return `lynco:document-draft:${id || 'new'}`
}

export function readRecoveryDraft(id?: string): RecoveryDraft | undefined {
  try {
    const raw = window.localStorage.getItem(recoveryKey(id))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as RecoveryDraft
    return parsed?.savedAt && parsed.payload ? parsed : undefined
  } catch {
    return undefined
  }
}

export function writeRecoveryDraft(id: string | undefined, payload: Partial<ArticlePayload>) {
  const draft: RecoveryDraft = { savedAt: new Date().toISOString(), payload }
  window.localStorage.setItem(recoveryKey(id), JSON.stringify(draft))
}

export function clearRecoveryDraft(id?: string) {
  window.localStorage.removeItem(recoveryKey(id))
}

export function isRecoveryNewer(draft: RecoveryDraft, databaseUpdatedAt?: string) {
  return !databaseUpdatedAt || new Date(draft.savedAt).getTime() > new Date(databaseUpdatedAt).getTime()
}
