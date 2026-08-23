import type { NextConfig } from 'next'
import path from 'node:path'

const glslLoader = path.resolve(process.cwd(), 'tools/glsl-loader.cjs')

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: process.cwd(),
    rules: {
      '*.glsl': {
        loaders: [{ loader: glslLoader }],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    // 保留 Webpack 回退配置，确保 shader include 在两种构建器下行为一致。
    config.module.rules.push({ test: /\.glsl$/i, use: [glslLoader] })
    return config
  },
}

export default nextConfig
