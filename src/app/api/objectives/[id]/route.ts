import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  OBJECTIVE_FIELDS,
  removeJuniorObjective,
  updateJuniorObjective,
} from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyObjectiveWrite,
  fields: OBJECTIVE_FIELDS,
  descriptor: { summary: 'Edit a personal objective', tags: ['academy'] },
  handler: ({ params, body, session, access }) =>
    updateJuniorObjective(params.id, academyScope(session, access), body),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyObjectiveWrite,
  descriptor: { summary: 'Drop a personal objective', tags: ['academy'] },
  handler: ({ params, session, access }) =>
    removeJuniorObjective(params.id, academyScope(session, access)),
})
