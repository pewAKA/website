import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'
import '@/styles/fumadocs.css'
import '@/styles/index.scss'
import { docsI18nProvider } from '@/lib/docs/translations'

const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

const instrumentSans = localFont({
  src: '../assets/fonts/InstrumentSans-Variable.ttf',
  variable: '--font-display',
  display: 'swap',
  weight: '400 700',
})

const ibmPlexMono = localFont({
  src: [
    { path: '../assets/fonts/IBMPlexMono-Regular.ttf', weight: '400' },
    { path: '../assets/fonts/IBMPlexMono-Medium.ttf', weight: '500' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lynco Hub',
    template: '%s · Lynco Hub',
  },
  description: '用代码、实时图形与产品思维构建可进入的 Web 交互实验。',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${ibmPlexMono.variable} flex min-h-dvh flex-col`}
      >
        <RootProvider
          i18n={docsI18nProvider}
          search={{ enabled: true }}
          theme={{ enabled: false, hotKey: false }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
