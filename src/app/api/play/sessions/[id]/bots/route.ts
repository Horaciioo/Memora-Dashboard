import { createProtectedRoute } from '@/core/lib/http/route'
import { addBots } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Seat bots in a lobby', tags: ['play'] },
  handler: async ({ params, session, raw }) =>
    addBots(params.id, session.id, { level: raw.level, fill: raw.fill === true }),
})
