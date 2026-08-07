import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const loader = require('../../tools/glsl-loader.cjs') as {
  expandShader: (source: string, resourcePath: string, options: { root: string }) => string
}
const temporaryDirectories: string[] = []

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lynco-glsl-'))
  temporaryDirectories.push(root)
  return root
}

describe('GLSL loader', () => {
  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  })

  it('展开相对与根路径多级 include', () => {
    const root = fixture()
    fs.mkdirSync(path.join(root, 'common'), { recursive: true })
    fs.writeFileSync(path.join(root, 'common', 'base.glsl'), 'float baseFn() { return 1.0; }')
    fs.writeFileSync(path.join(root, 'middle.glsl'), '#include /common/base.glsl\nfloat middleFn() { return baseFn(); }')
    const entry = path.join(root, 'entry.glsl')

    const result = loader.expandShader('#include ./middle.glsl\nvoid main() {}', entry, { root })
    expect(result).toContain('float baseFn()')
    expect(result).toContain('float middleFn()')
  })

  it('去除重复 include', () => {
    const root = fixture()
    fs.writeFileSync(path.join(root, 'shared.glsl'), 'float sharedFn() { return 1.0; }')
    const result = loader.expandShader('#include ./shared.glsl\n#include ./shared.glsl', path.join(root, 'entry.glsl'), { root })
    expect(result.match(/sharedFn/g)).toHaveLength(1)
  })

  it('报告循环引用', () => {
    const root = fixture()
    fs.writeFileSync(path.join(root, 'a.glsl'), '#include ./b.glsl')
    fs.writeFileSync(path.join(root, 'b.glsl'), '#include ./a.glsl')
    expect(() => loader.expandShader('#include ./a.glsl', path.join(root, 'entry.glsl'), { root })).toThrow('循环引用')
  })

  it('报告缺失文件', () => {
    const root = fixture()
    expect(() => loader.expandShader('#include ./missing.glsl', path.join(root, 'entry.glsl'), { root })).toThrow('文件不存在')
  })
})
