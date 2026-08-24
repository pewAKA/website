import { requireAdmin } from '@/server/auth/session'
import { fail, ok, readJson } from '@/server/http/response'
import { articleService } from '@/server/services/article-service'
import { positiveIdSchema, taxonomyUpsertSchema } from '@/server/validation/articles'
import { revalidateDocsSource } from '@/lib/docs/source'

export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: Context) {
  try {
    await requireAdmin(request.headers)
    const id = positiveIdSchema.parse((await context.params).id)
    const input = taxonomyUpsertSchema.parse(await readJson(request))
    const tag = await articleService.updateTag(id, input)
    await revalidateDocsSource()
    return ok(tag)
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    await requireAdmin(request.headers)
    const id = positiveIdSchema.parse((await context.params).id)
    await articleService.deleteTag(id)
    await revalidateDocsSource()
    return ok(null)
  } catch (error) {
    return fail(error)
  }
}
