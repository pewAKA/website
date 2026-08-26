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
            colorBgBase: '#f1f2ef',
            colorBgContainer: '#f8f9f6',
            colorBgElevated: '#f8f9f6',
            colorBorder: '#d8dad6',
            colorLink: '#121311',
            colorPrimary: '#121311',
            colorPrimaryBg: '#e0e2de',
            colorPrimaryBgHover: '#d8dad6',
            colorText: '#252824',
            colorTextDescription: '#656a63',
            borderRadius: 8,
          },
          components: {
            Select: {
              optionActiveBg: '#e9ebe7',
              optionSelectedBg: '#e0e2de',
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
