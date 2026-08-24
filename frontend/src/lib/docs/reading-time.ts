/**
 * 统一公开文档与工作台的阅读时长估算规则，避免预览和发布后显示不一致。
 */
export function estimateReadingMinutes(content: string) {
  const cjkCharacters = content.match(/[\u3400-\u9fff]/g)?.length ?? 0
  const latinWords = content.match(/[A-Za-z0-9_]+/g)?.length ?? 0
  return Math.max(1, Math.ceil(cjkCharacters / 350 + latinWords / 220))
}
