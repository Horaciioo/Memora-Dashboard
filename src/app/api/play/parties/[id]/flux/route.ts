import { createStreamRoute } from '@/core/lib/http/route'
import { playStream } from '@/core/lib/play/stream'
import { watchSession } from '@/core/lib/play/watchers'
import { loadSession } from '@/core/services/play'
import { PLAY_TOPICS } from '@/declarations/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createStreamRoute({
  permission: Permissions.PlayAccess,
  rateLimit: false,
  descriptor: { summary: 'Follow a game', tags: ['play'] },
  open: async ({ request, params, session }) => {
    // Unknown games refuse the stream
    const game = await loadSession(params.id)
    const stream = playStream(request, PLAY_TOPICS.session(game.id))
    watchSession(game.id, session.id, request.signal)

    return stream
  },
})
