import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { reorderJuniorObjectives } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyObjectiveWrite,
  descriptor: { summary: 'Reorder the personal objectives of a junior', tags: ['academy'] },
  handler: ({ params, raw, session, access }) =>
    reorderJuniorObjectives(
      params.id,
      academyScope(session, access),
      Array.isArray(raw.ids) ? raw.ids.map(String) : []
    ),
})
