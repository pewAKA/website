import { articleService } from '@/server/services/article-service'
import { requireAdmin } from '@/server/auth/session'
import { fail, ok } from '@/server/http/response'
import { positiveIdSchema } from '@/server/validation/articles'

export const runtime = 'nodejs'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request.headers)
    const id = positiveIdSchema.parse((await context.params).id)
    return ok(await articleService.publish(id))
  } catch (error) {
    return fail(error)
  }
}
