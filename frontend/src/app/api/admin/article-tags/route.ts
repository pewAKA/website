import { requireAdmin } from '@/server/auth/session'
import { fail, ok, readJson } from '@/server/http/response'
import { articleService } from '@/server/services/article-service'
import { taxonomyUpsertSchema } from '@/server/validation/articles'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers)
    return ok(await articleService.listTags())
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers)
    const input = taxonomyUpsertSchema.parse(await readJson(request))
    return ok(await articleService.createTag(input))
  } catch (error) {
    return fail(error)
  }
}
