import { createProtectedRoute } from '@/core/lib/http/route'
import { readBodyText } from '@/core/lib/play'
import { kickPlayer } from '@/core/services/play'
import { PLAY_ERRORS } from '@/declarations/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Remove a player from a game', tags: ['play'] },
  handler: async ({ params, session, raw }) =>
    kickPlayer(params.id, session.id, readBodyText(raw, 'accountId', PLAY_ERRORS.notSeated)),
})
