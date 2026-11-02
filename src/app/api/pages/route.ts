import { createProtectedRoute } from '@/core/lib/http/route'
import { createPage, listPages, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'List the pages the member may open', tags: ['pages'] },
  handler: ({ session }) => listPages(viewerOf(session)),
})

export const POST = createProtectedRoute({
  status: 201,
  descriptor: { summary: 'Create a private page', tags: ['pages'] },
  handler: ({ raw, session }) =>
    createPage(viewerOf(session), { parentId: raw.parentId, categoryId: raw.categoryId, template: raw.template }),
})
