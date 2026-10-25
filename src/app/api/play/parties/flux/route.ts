import { createStreamRoute } from '@/core/lib/http/route'
import { playStream } from '@/core/lib/play/stream'
import { PLAY_TOPICS } from '@/declarations/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createStreamRoute({
  permission: Permissions.PlayAccess,
  rateLimit: false,
  descriptor: { summary: 'Follow the lobbies', tags: ['play'] },
  open: async ({ request }) => playStream(request, PLAY_TOPICS.lobbies),
})
