import { createStreamRoute } from '@/core/lib/http/route'
import { playStream } from '@/core/lib/play/stream'
import { loadSession } from '@/core/services/play'
import { PLAY_TOPICS } from '@/declarations/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createStreamRoute({
  permission: Permissions.PlayAccess,
  rateLimit: false,
  descriptor: { summary: 'Follow a game', tags: ['play'] },
  open: async ({ request, params }) => {
    // Unknown games refuse the stream
    const session = await loadSession(params.id)

    return playStream(request, PLAY_TOPICS.session(session.id))
  },
})
