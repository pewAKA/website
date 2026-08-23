// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import { localMediaStorage } from '@/server/media/storage'

vi.mock('server-only', () => ({}))

function fakeFile(size: number, type: string, bytes = new Uint8Array()) {
  return {
    size,
    type,
    arrayBuffer: async () => bytes.buffer,
  } as File
}

describe('本地图片存储', () => {
  it('拒绝空文件和超过 5 MB 的文件', async () => {
    await expect(localMediaStorage.store(fakeFile(0, 'image/png'))).rejects.toThrow('请选择')
    await expect(localMediaStorage.store(fakeFile(5 * 1024 * 1024 + 1, 'image/png'))).rejects.toThrow(
      '不能超过 5 MB',
    )
  })

  it('不信任浏览器声明的 MIME', async () => {
    const textBytes = new TextEncoder().encode('这不是 PNG 文件')
    await expect(
      localMediaStorage.store(fakeFile(textBytes.byteLength, 'image/png', textBytes)),
    ).rejects.toThrow('仅支持真实的 JPEG、PNG 和 WebP')
  })
})
