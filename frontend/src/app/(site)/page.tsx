import type { Metadata } from 'next'
import Home from '@/features/Home'
import { getDocumentCategory, getDocumentHref, getRecentDocuments } from '@/lib/docs/repository'

export const metadata: Metadata = {
  title: '首页',
  description: 'Lynco Hub 的项目作品、技术文章和个人内容入口。',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const articles = (await getRecentDocuments(2)).map((document) => ({
    id: document.id,
    title: document.title,
    href: getDocumentHref(document),
    publishedAt: document.publishedAt,
    categoryName: getDocumentCategory(document.category)?.name || document.category,
  }))

  return <Home articles={articles} />
}
