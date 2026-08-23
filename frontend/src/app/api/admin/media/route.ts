import { requireAdmin } from '@/server/auth/session'
import { ApiError } from '@/server/http/errors'
import { fail, ok } from '@/server/http/response'
import { localMediaStorage } from '@/server/media/storage'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers)
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      throw new ApiError(400, 'VALIDATION_ERROR', '上传请求格式不合法')
    }
    const file = formData.get('file')
    if (!(file instanceof File)) throw new ApiError(400, 'VALIDATION_ERROR', '请选择需要上传的图片')
    return ok(await localMediaStorage.store(file))
  } catch (error) {
    return fail(error)
  }
}
