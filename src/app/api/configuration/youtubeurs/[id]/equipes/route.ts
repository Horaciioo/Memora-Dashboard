import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  readCreatorTeams,
  setCreatorFunctions,
  setMemberTeams,
} from '@/core/services/teams/CreatorTeamService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read submitted identifiers
 * @param {unknown} value - Raw list
 * @return {string[]} - Identifiers
 */

const readIds = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : [])

export const GET = createProtectedRoute({
  permission: Permissions.TeamRead,
  descriptor: { summary: 'Read the teams of a creator', tags: ['teams'] },
  handler: async ({ params, scope }) => readCreatorTeams(params.id, await scope()),
})

export const PUT = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: { summary: 'Switch the teams of a creator on or off', tags: ['teams'] },
  handler: async ({ params, raw, scope }) =>
    setCreatorFunctions(params.id, readIds(raw.functionIds), await scope()),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: { summary: 'Set the teams a member sits in', tags: ['teams'] },
  handler: async ({ params, raw, scope }) => {
    const accountId = String(raw.accountId ?? '')
    if (!accountId) throw invalidInput([{ field: 'accountId', message: FORM_COPY.required }])

    return setMemberTeams(params.id, accountId, readIds(raw.functionIds), await scope())
  },
})
