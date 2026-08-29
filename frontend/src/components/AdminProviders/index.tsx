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
            // Ant Design 会对主题色做派生计算，使用 CSS 变量会使浮层颜色回退为黑色。
            colorBgBase: '#ffffff',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',
            colorBorder: '#dfe1e5',
            colorLink: '#111111',
            colorPrimary: '#111111',
            colorPrimaryBg: '#eceef1',
            colorPrimaryBgHover: '#e2e5e9',
            colorText: '#262626',
            colorTextDescription: '#686868',
            borderRadius: 8,
          },
          components: {
            Select: {
              optionActiveBg: '#f6f7f8',
              optionSelectedBg: '#eceef1',
            },
          },
        }}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
