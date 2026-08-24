import { articleService } from '@/server/services/article-service'
import { requireAdmin } from '@/server/auth/session'
import { fail, ok, readJson } from '@/server/http/response'
import { articleUpsertSchema, positiveIdSchema } from '@/server/validation/articles'
import { revalidateDocsSource } from '@/lib/docs/source'

export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    await requireAdmin(request.headers)
    const id = positiveIdSchema.parse((await context.params).id)
    return ok(await articleService.getAdmin(id))
  } catch (error) {
    return fail(error)
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    await requireAdmin(request.headers)
    const id = positiveIdSchema.parse((await context.params).id)
    const input = articleUpsertSchema.parse(await readJson(request))
    const article = await articleService.update(id, input)
    await revalidateDocsSource()
    return ok(article)
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    await requireAdmin(request.headers)
    const id = positiveIdSchema.parse((await context.params).id)
    await articleService.deleteArticle(id)
    await revalidateDocsSource()
    return ok(null)
  } catch (error) {
    return fail(error)
  }
}
