import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleDocument } from '@/features/Docs/ArticleDocument'
import DocsCollection from '@/features/Docs/Collection'
import DocsPortal from '@/features/Docs/Portal'
import {
  createDocumentCategories,
  createDocumentTags,
  getCategoryHref,
  getTagHref,
} from '@/lib/docs/repository'
import { getDocsSource } from '@/lib/docs/source'
import { databaseDocumentRepository } from '@/server/repositories/document-repository'

export const dynamic = 'force-dynamic'

async function loadPage(slugs: string[]) {
  const source = await getDocsSource()
  const page = source.getPage(slugs)
  if (!page) notFound()
  return page
}

async function resolveCollection(slugs: string[]) {
  if (slugs.length !== 2) return undefined

  if (slugs[0] === 'categories') {
    const documents = await databaseDocumentRepository.list()
    const category = createDocumentCategories(documents).find((item) => item.slug === slugs[1])
    if (!category) return undefined
    return {
      kind: 'category' as const,
      title: category.name,
      description: category.description,
      canonical: getCategoryHref(category.slug),
      documents: await databaseDocumentRepository.listByCategory(category.slug),
    }
  }

  if (slugs[0] === 'tags') {
    const tag = createDocumentTags(await databaseDocumentRepository.list()).find(
      (item) => item.slug === slugs[1],
    )
    if (!tag) return undefined
    return {
      kind: 'tag' as const,
      title: tag.name,
      description: `汇集带有 ${tag.name} 标签的实现记录，跨分类查看相关问题与解决路径。`,
      canonical: getTagHref(tag.name),
      documents: await databaseDocumentRepository.listByTag(tag.name),
    }
  }

  return undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const slugs = (await params).slug ?? []
  const collection = await resolveCollection(slugs)

  if (collection) {
    return {
      title: collection.kind === 'tag' ? `#${collection.title}` : collection.title,
      description: collection.description,
      alternates: { canonical: collection.canonical },
    }
  }

  const page = await loadPage(slugs)
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      images: page.data.coverImage ? [page.data.coverImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const slugs = (await params).slug ?? []

  if (slugs.length === 0) {
    return <DocsPortal documents={await databaseDocumentRepository.list()} />
  }

  const collection = await resolveCollection(slugs)
  if (collection) {
    if (collection.documents.length === 0) notFound()
    return <DocsCollection {...collection} />
  }

  const page = await loadPage(slugs)

  return <ArticleDocument document={page.data} />
}
