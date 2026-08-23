import { NextResponse } from 'next/server'
import { ApiError, toApiError } from './errors'

export type ApiResponse<T> = {
  code: string
  message: string
  data: T
}

export function ok<T>(data: T) {
  return NextResponse.json<ApiResponse<T>>({ code: 'OK', message: '操作成功', data })
}

export function fail(error: unknown) {
  const apiError = toApiError(error)
  return NextResponse.json(
    { code: apiError.code, message: apiError.message, data: null },
    { status: apiError.status },
  )
}

export async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    throw new ApiError(400, 'VALIDATION_ERROR', '请求体必须是有效 JSON')
  }
}
