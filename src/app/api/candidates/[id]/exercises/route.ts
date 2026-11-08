import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createLinks, listLinks } from '@/core/services/recruitment/ExerciseLinkService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.RecruitmentRead,
  descriptor: { summary: 'List the written-context links of a candidate', tags: ['recruitment'] },
  handler: async ({ params, scope }) => listLinks(params.id, await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  status: 201,
  descriptor: { summary: 'Hand out the written-context links', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const keys = Array.isArray(raw.contextKeys) ? raw.contextKeys : []
    if (keys.length !== 2 || !keys.every((key) => typeof key === 'string')) throw invalidInput([])

    return createLinks(params.id, keys as string[], await scope(), session.id)
  },
})
