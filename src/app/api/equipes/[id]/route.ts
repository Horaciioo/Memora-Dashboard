import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeTeam, teamFields, updateTeam } from '@/core/services/teams/TeamService'
import { Permissions } from '@/utils/constants/permissions'

// A creator identifier narrows the board to that creator's teams
const SCOPE_PARAM = 'youtubeur'

export const PATCH = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: { summary: 'Edit a team', tags: ['teams'] },
  handler: async ({ params, raw, query, scope }) => {
    const parsed = parseFormValues(await teamFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateTeam(params.id, parsed.values, await scope(), query.get(SCOPE_PARAM) ?? undefined)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: { summary: 'Drop a team', tags: ['teams'] },
  handler: async ({ params, query, scope }) =>
    removeTeam(params.id, await scope(), query.get(SCOPE_PARAM) ?? undefined),
})
