import { createProtectedRoute } from '@/core/lib/http/route'
import { readSharing, setInheritance, upsertShare, viewerOf } from '@/core/services/pages'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read who reaches a page', tags: ['pages'] },
  handler: ({ params, session }) => readSharing(params.id, viewerOf(session)),
})

export const PUT = createProtectedRoute({
  descriptor: { summary: 'Give or change one share', tags: ['pages'] },
  handler: ({ params, raw, session }) => upsertShare(params.id, viewerOf(session), raw),
})

export const PATCH = createProtectedRoute({
  descriptor: { summary: 'Take or cut the parent shares', tags: ['pages'] },
  handler: ({ params, raw, session }) =>
    setInheritance(params.id, viewerOf(session), raw.inheritAccess === true),
})
