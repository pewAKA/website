import 'server-only'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import { serverConfig } from '@/server/config'
import { ApiError } from '@/server/http/errors'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const extensions = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export interface MediaStorage {
  store(file: File): Promise<{ url: string; fileName: string }>
}

export const localMediaStorage: MediaStorage = {
  async store(file) {
    if (!file || file.size === 0) throw new ApiError(400, 'VALIDATION_ERROR', '请选择需要上传的图片')
    if (file.size > MAX_FILE_SIZE) throw new ApiError(400, 'VALIDATION_ERROR', '图片大小不能超过 5 MB')

    const buffer = Buffer.from(await file.arrayBuffer())
    const detected = await fileTypeFromBuffer(buffer)
    const extension = detected ? extensions.get(detected.mime) : undefined
    if (!extension || file.type !== detected?.mime) {
      throw new ApiError(400, 'VALIDATION_ERROR', '仅支持真实的 JPEG、PNG 和 WebP 图片')
    }

    // 上传目录是运行时挂载点，不属于 Next.js 构建追踪范围。
    const root = path.isAbsolute(serverConfig.mediaRoot)
      ? path.normalize(serverConfig.mediaRoot).replace(/[\\/]+$/, '')
      : path.join(/* turbopackIgnore: true */ process.cwd(), serverConfig.mediaRoot)
    if (!root || root === path.parse(root).root) {
      throw new ApiError(500, 'MEDIA_STORAGE_ERROR', '媒体目录不能指向文件系统根目录')
    }
    const fileName = `${randomUUID()}.${extension}`
    const target = `${root}${path.sep}${fileName}`
    if (!target.startsWith(`${root}${path.sep}`)) {
      throw new ApiError(500, 'MEDIA_STORAGE_ERROR', '图片保存路径不合法')
    }

    try {
      await mkdir(root, { recursive: true })
      // UUID 文件名与 wx 模式共同保证上传不会覆盖已有文件。
      await writeFile(target, buffer, { flag: 'wx' })
    } catch (error) {
      console.error('图片保存失败', error)
      throw new ApiError(500, 'MEDIA_STORAGE_ERROR', '图片保存失败，请检查服务器媒体目录权限')
    }

    return { url: `${serverConfig.mediaPublicPath}/${fileName}`, fileName }
  },
}
