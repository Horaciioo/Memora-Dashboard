import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { listReferents } from '@/core/services/academy/FollowUpService'
import { Permissions } from '@/utils/constants/permissions'

// Longest search
const SEARCH_MAX_LENGTH = 100

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Find the referents who follow a junior', tags: ['academy'] },
  handler: async ({ query, session, access }) => {
    // Following another referent is a responsable's gesture
    if (!access.isResponsable && !access.isAdmin) return []

    return listReferents(
      academyScope(session, access),
      (query.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH).trim()
    )
  },
})
