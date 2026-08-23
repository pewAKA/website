import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isDuplicateEntry(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ER_DUP_ENTRY'
  )
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) return error
  if (error instanceof ZodError) {
    return new ApiError(400, 'VALIDATION_ERROR', error.issues[0]?.message || '请求参数不合法')
  }
  console.error('未处理的服务异常', error)
  return new ApiError(500, 'INTERNAL_ERROR', '服务器内部错误')
}
