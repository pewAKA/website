import { redirect } from 'next/navigation'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/articles/manage/${encodeURIComponent((await params).id)}`)
}
