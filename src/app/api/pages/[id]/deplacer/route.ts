import { createProtectedRoute } from '@/core/lib/http/route'
import { movePage, viewerOf } from '@/core/services/pages'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Move a page in the tree', tags: ['pages'] },
  handler: ({ params, raw, session }) =>
    movePage(params.id, viewerOf(session), { parentId: raw.parentId, categoryId: raw.categoryId, position: raw.position }),
})
