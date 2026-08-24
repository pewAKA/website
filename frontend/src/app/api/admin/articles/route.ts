import { articleService } from '@/server/services/article-service'
import { requireAdmin } from '@/server/auth/session'
import { fail, ok, readJson } from '@/server/http/response'
import { adminArticleListSchema, articleUpsertSchema } from '@/server/validation/articles'
import { revalidateDocsSource } from '@/lib/docs/source'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers)
    const url = new URL(request.url)
    const query = adminArticleListSchema.parse({
      status: url.searchParams.get('status') || undefined,
      page: url.searchParams.get('page') || undefined,
      pageSize: url.searchParams.get('pageSize') || undefined,
    })
    return ok(await articleService.listAdmin(query.status, query.page, query.pageSize))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers)
    const input = articleUpsertSchema.parse(await readJson(request))
    const article = await articleService.create(input)
    await revalidateDocsSource()
    return ok(article)
  } catch (error) {
    return fail(error)
  }
}
