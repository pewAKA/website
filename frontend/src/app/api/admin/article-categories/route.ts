import { requireAdmin } from '@/server/auth/session'
import { fail, ok, readJson } from '@/server/http/response'
import { articleService } from '@/server/services/article-service'
import { taxonomyUpsertSchema } from '@/server/validation/articles'
import { revalidateDocsSource } from '@/lib/docs/source'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers)
    return ok(await articleService.listCategories())
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers)
    const input = taxonomyUpsertSchema.parse(await readJson(request))
    const category = await articleService.createCategory(input)
    await revalidateDocsSource()
    return ok(category)
  } catch (error) {
    return fail(error)
  }
}
