import { createProtectedRoute } from '@/core/lib/http/route'
import { readCreatorTeams, setCreatorFunctions } from '@/core/services/teams/CreatorTeamService'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read submitted identifiers
 * @param {unknown} value - Raw list
 * @return {string[]} - Identifiers
 */

const readIds = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : [])

export const GET = createProtectedRoute({
  permission: Permissions.TeamRead,
  descriptor: { summary: 'Read the functions of a creator and who holds them', tags: ['teams'] },
  handler: async ({ params, scope }) => readCreatorTeams(params.id, await scope()),
})

export const PUT = createProtectedRoute({
  permission: Permissions.TeamManage,
  descriptor: {
    summary:
      'Switch the functions of a creator on or off, closing one is for the root administrator',
    tags: ['teams'],
  },
  handler: async ({ params, raw, scope, session }) =>
    setCreatorFunctions(params.id, readIds(raw.functionIds), await scope(), session.isRoot),
})
