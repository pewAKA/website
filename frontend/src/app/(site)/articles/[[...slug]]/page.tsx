import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createCompiler } from '@fumadocs/mdx-remote'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/docs/page'
import Link from 'next/link'
import { getDocsMdxComponents } from '@/components/DocsMdx'
import DocsCollection from '@/features/Docs/Collection'
import DocsPortal from '@/features/Docs/Portal'
import { documentCategories } from '@/lib/docs/mock-documents'
import {
  getCategoryHref,
  getDocumentCategory,
  getDocumentTag,
  getDocumentTags,
  getTagHref,
  mockDocumentRepository,
} from '@/lib/docs/repository'
import { getDocsSource } from '@/lib/docs/source'

const compiler = createCompiler()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

async function loadPage(slugs: string[]) {
  const source = await getDocsSource()
  const page = source.getPage(slugs)
  if (!page) notFound()
  return page
}

async function resolveCollection(slugs: string[]) {
  if (slugs.length !== 2) return undefined

  if (slugs[0] === 'categories') {
    const category = getDocumentCategory(slugs[1])
    if (!category) return undefined
    return {
      kind: 'category' as const,
      title: category.name,
      description: category.description,
      canonical: getCategoryHref(category.slug),
      documents: await mockDocumentRepository.listByCategory(category.slug),
    }
  }

  if (slugs[0] === 'tags') {
    const tag = await getDocumentTag(slugs[1])
    if (!tag) return undefined
    return {
      kind: 'tag' as const,
      title: tag.name,
      description: `汇集带有 ${tag.name} 标签的实现记录，跨分类查看相关问题与解决路径。`,
      canonical: getTagHref(tag.name),
      documents: await mockDocumentRepository.listByTag(tag.name),
    }
  }

  return undefined
}

export async function generateStaticParams() {
  const source = await getDocsSource()
  const tags = await getDocumentTags()
  return [
    ...source.generateParams(),
    ...documentCategories.map((category) => ({ slug: ['categories', category.slug] })),
    ...tags.map((tag) => ({ slug: ['tags', tag.slug] })),
  ]
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
    return <DocsPortal documents={await mockDocumentRepository.list()} />
  }

  const collection = await resolveCollection(slugs)
  if (collection) {
    if (collection.documents.length === 0) notFound()
    return <DocsCollection {...collection} />
  }

  const page = await loadPage(slugs)

  /* MDX Remote 会执行可信内容；未来接回后端时，只允许管理员维护的正文进入这里。 */
  const { body: MdxContent, toc } = await compiler.compile({
    source: page.data.content,
    filePath: `${slugs.join('/')}.mdx`,
  })
  const category = getDocumentCategory(page.data.category)

  return (
    <DocsPage className="docs-article" toc={toc}>
      <div className="docs-article__eyebrow">
        <Link href={getCategoryHref(page.data.category)}>
          {category?.name || page.data.category}
        </Link>
        <span>{formatDate(page.data.publishedAt)}</span>
        <span>{page.data.readingMinutes} 分钟阅读</span>
      </div>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="docs-article__tags" aria-label="文章标签">
        {page.data.tags.map((tag) => (
          <Link href={getTagHref(tag)} key={tag}>
            #{tag}
          </Link>
        ))}
      </div>
      <DocsBody className="docs-article__body">
        <MdxContent components={getDocsMdxComponents()} />
      </DocsBody>
      <PageLastUpdate className="docs-article__updated" date={new Date(page.data.updatedAt)} />
    </DocsPage>
  )
}
