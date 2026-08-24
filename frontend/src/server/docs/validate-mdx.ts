import 'server-only'
import { createCompiler } from '@fumadocs/mdx-remote'
import { ApiError } from '@/server/http/errors'

const compiler = createCompiler()

/**
 * 后台正文与公开页使用同一个 MDX 编译器。内容只能来自已授权管理员，
 * 这里负责阻止语法错误进入数据库，不负责执行不可信的外部 MDX。
 */
export async function validateTrustedMdx(source: string) {
  try {
    await compiler.compile({ source, filePath: 'admin-document.mdx' })
  } catch (error) {
    const detail = error instanceof Error ? error.message : '未知解析错误'
    throw new ApiError(400, 'VALIDATION_ERROR', `MDX 解析失败：${detail}`)
  }
}
