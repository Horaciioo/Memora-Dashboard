import { createProtectedRoute } from '@/core/lib/http/route'
import { readPage, trashPage, updatePageMeta, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Open a page the member may read', tags: ['pages'] },
  handler: ({ params, session }) => readPage(params.id, viewerOf(session)),
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Change the title, icon or cover', tags: ['pages'] },
  handler: ({ params, raw, session }) => updatePageMeta(params.id, viewerOf(session), raw),
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Move a page to the trash', tags: ['pages'] },
  handler: ({ params, session }) => trashPage(params.id, viewerOf(session)),
})
