import type { Metadata } from 'next'
import Home from '@/features/Home'
import { getDocumentCategory, getDocumentHref } from '@/lib/docs/repository'
import { getRecentDatabaseDocuments } from '@/server/repositories/document-repository'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '首页',
  description: 'Lynco Hub 的项目作品、技术文章和个人内容入口。',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const articles = (await getRecentDatabaseDocuments(2)).map((document) => ({
    id: document.id,
    title: document.title,
    href: getDocumentHref(document),
    publishedAt: document.publishedAt,
    categoryName:
      document.categoryName || getDocumentCategory(document.category)?.name || document.category,
  }))

  return <Home articles={articles} />
}
