import { createProtectedRoute } from '@/core/lib/http/route'
import { readSession, updateSettings } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read a game', tags: ['play'] },
  handler: async ({ params, session }) => readSession(params.id, session.id),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Change the settings of a lobby', tags: ['play'] },
  handler: async ({ params, session, raw }) => updateSettings(params.id, session.id, raw),
})
