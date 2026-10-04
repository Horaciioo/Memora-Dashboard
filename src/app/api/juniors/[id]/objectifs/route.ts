import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope, assertJuniorViewer } from '@/core/services/academy/AcademyScope'
import {
  OBJECTIVE_FIELDS,
  createJuniorObjective,
  juniorAccount,
  listJuniorObjectives,
} from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

// A junior never reads the objectives set for them
export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Read the personal objectives of a junior', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    const scope = academyScope(session, access)
    const junior = await juniorAccount(params.id, scope)
    assertJuniorViewer(session, access, junior)
    if (junior.accountId === session.id) throw forbidden()

    return listJuniorObjectives(params.id, scope)
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyObjectiveWrite,
  status: 201,
  fields: OBJECTIVE_FIELDS,
  descriptor: { summary: 'Set a personal objective', tags: ['academy'] },
  handler: ({ params, body, session, access }) =>
    createJuniorObjective(params.id, academyScope(session, access), session.id, body),
})
