const fs = require('node:fs')
const path = require('node:path')

const includePattern = /^\s*#include\s+(.+?)\s*$/gm

function expandShader(source, resourcePath, options = {}, state) {
  const root = options.root || path.resolve(process.cwd(), 'src/shaders')
  const currentState = state || {
    included: new Set(),
    stack: [resourcePath],
    dependencies: new Set(),
  }

  return source.replace(includePattern, (_match, request) => {
    const cleanedRequest = request.trim().replace(/^['"]|['"]$/g, '')
    const includePath = cleanedRequest.startsWith('/')
      ? path.resolve(root, `.${cleanedRequest}`)
      : path.resolve(path.dirname(resourcePath), cleanedRequest)

    if (currentState.stack.includes(includePath)) {
      throw new Error(`GLSL include 存在循环引用：${[...currentState.stack, includePath].join(' -> ')}`)
    }
    if (!fs.existsSync(includePath)) {
      throw new Error(`GLSL include 文件不存在：${includePath}`)
    }
    if (currentState.included.has(includePath)) {
      return ''
    }

    currentState.included.add(includePath)
    currentState.dependencies.add(includePath)
    const nestedSource = fs.readFileSync(includePath, 'utf8')
    return expandShader(nestedSource, includePath, options, {
      ...currentState,
      stack: [...currentState.stack, includePath],
    })
  })
}

function glslLoader(source) {
  this.cacheable?.()
  const state = {
    included: new Set(),
    stack: [this.resourcePath],
    dependencies: new Set(),
  }
  const expanded = expandShader(
    source,
    this.resourcePath,
    { root: path.resolve(process.cwd(), 'src/shaders') },
    state,
  )

  // 将 include 文件登记为构建依赖，内容变化后开发服务器会重新编译。
  for (const dependency of state.dependencies) {
    this.addDependency?.(dependency)
  }

  return `export default ${JSON.stringify(expanded)};`
}

glslLoader.expandShader = expandShader
module.exports = glslLoader
