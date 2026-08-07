import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    glsl({
      // 以 frontend/src/shaders 作为项目级 GLSL 公共目录。
      root: '/src/shaders/',
      // 公共 GLSL 片段可能被多级依赖，构建时自动移除重复导入。
      removeDuplicatedImports: true,
      warnDuplicatedImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 供 TypeScript 直接导入项目级 shader；GLSL 内使用根路径 #include。
      '@shaders': fileURLToPath(new URL('./src/shaders', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // 本地开发时前端仍请求 /api，由 Vite 转发到通过 SSH 隧道启动的后端服务。
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
