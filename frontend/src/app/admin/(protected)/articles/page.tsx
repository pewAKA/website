import { redirect } from 'next/navigation'

export default function AdminArticlesPage() {
  redirect('/articles/manage')
}
