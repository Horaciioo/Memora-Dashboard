import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeTeam, teamFields, updateTeam } from '@/core/services/teams/TeamService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: { summary: 'Edit a team', tags: ['teams'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(await teamFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateTeam(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: { summary: 'Drop a team', tags: ['teams'] },
  handler: ({ params }) => removeTeam(params.id),
})
