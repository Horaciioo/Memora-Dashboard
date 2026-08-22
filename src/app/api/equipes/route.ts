import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createTeam, moveMember, readTeamBoard, teamFields } from '@/core/services/teams/TeamService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.TeamRead,
  descriptor: { summary: 'Read the team board', tags: ['teams'] },
  handler: () => readTeamBoard(),
})

export const POST = createProtectedRoute({
  permission: Permissions.TeamManage,
  status: 201,
  descriptor: { summary: 'Create a team', tags: ['teams'] },
  handler: async ({ raw }) => {
    const parsed = parseFormValues(await teamFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createTeam(parsed.values)
  },
})

export const PATCH = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: { summary: 'Move a member between teams', tags: ['teams'] },
  handler: ({ raw }) => {
    const accountId = String(raw.accountId ?? '')
    if (!accountId) throw invalidInput([{ field: 'accountId', message: FORM_COPY.required }])

    const teamId = raw.teamId === null || raw.teamId === undefined ? null : String(raw.teamId)

    return moveMember(accountId, teamId)
  },
})
