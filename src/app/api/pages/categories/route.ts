import { createProtectedRoute } from '@/core/lib/http/route'
import { createCategory, listCategories, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'List the categories of the private rail', tags: ['pages'] },
  handler: ({ session }) => listCategories(viewerOf(session)),
})

export const POST = createProtectedRoute({
  status: 201,
  descriptor: { summary: 'Create a page category', tags: ['pages'] },
  handler: ({ raw, session }) => createCategory(viewerOf(session), { name: raw.name }),
})
