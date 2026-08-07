import type { NextConfig } from 'next'
import path from 'node:path'

const apiOrigin = (process.env.API_ORIGIN || 'http://127.0.0.1:8081').replace(/\/$/, '')
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
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/sitemap.xml', destination: `${apiOrigin}/api/sitemap.xml` },
    ]
  },
}

export default nextConfig
