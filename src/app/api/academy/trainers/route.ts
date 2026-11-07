import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { listTrainers } from '@/core/services/academy/FollowUpService'
import { Permissions } from '@/utils/constants/permissions'

// Longest search
const SEARCH_MAX_LENGTH = 100

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Find the trainers who follow a junior', tags: ['academy'] },
  handler: async ({ query, session, access }) => {
    // Following another trainer is a responsable's gesture
    if (!access.isResponsable && !access.isAdmin) return []

    return listTrainers(
      academyScope(session, access),
      (query.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH).trim()
    )
  },
})
