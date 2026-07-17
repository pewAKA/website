import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import zhCN from 'antd/locale/zh_CN'
import { RouterProvider } from 'react-router/dom'
import 'antd/dist/reset.css'
import '@/styles/index.scss'
import StartupPreloader from '@/components/StartupPreloader'
import { queryClient } from '@/lib/queryClient'
import { StartupPreloadProvider } from '@/providers/StartupPreloadProvider'
import { router } from '@/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorBgBase: 'var(--color-page-bg)',
            colorBgContainer: 'var(--color-surface-strong)',
            colorBorder: 'var(--color-line)',
            colorLink: 'var(--color-primary)',
            colorPrimary: 'var(--color-primary)',
            colorText: 'var(--color-text)',
            colorTextDescription: 'var(--color-muted)',
            borderRadius: 8,
          },
        }}
      >
        <StartupPreloadProvider>
          <RouterProvider router={router} />
          <StartupPreloader />
        </StartupPreloadProvider>
      </ConfigProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
