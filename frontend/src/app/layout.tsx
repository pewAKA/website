import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/styles/index.scss'

const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lynco Hub',
    template: '%s · Lynco Hub',
  },
  description: '一个用于整理项目作品、技术文章与个人信息的内容中枢。',
  icons: { icon: '/favicon.svg' },
}

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('lynco-hub-theme');
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch {}
})();`

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
