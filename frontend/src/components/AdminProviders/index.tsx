'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { App as AntApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { createAppQueryClient } from '@/lib/queryClient'
import { setUnauthorizedHandler } from '@/services/request'

export default function AdminProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createAppQueryClient)

  useEffect(() => {
    setUnauthorizedHandler(() => queryClient.clear())
    return () => setUnauthorizedHandler(undefined)
  }, [queryClient])

  return (
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
        <AntApp>{children}</AntApp>
      </ConfigProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
