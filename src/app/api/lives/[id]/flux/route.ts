import { createStreamRoute } from '@/core/lib/http/route'
import { liveStreamOf } from '@/core/lib/lives/stream'
import { readLive } from '@/core/services/lives/LiveService'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { Permissions } from '@/utils/constants/permissions'

// Each signal names its kind
const openStream = liveStreamOf((payload) => {
  const { type, ...data } = payload as { type: string }

  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
})

export const GET = createStreamRoute({
  permission: Permissions.LiveRead,
  rateLimit: false,
  descriptor: { summary: 'Follow the Mod View feed of one live', tags: ['lives'] },
  open: async ({ request, params, session, scope }) => {
    // Only a live of the viewer's perimeter is followed
    await readLive(params.id, await scope(), session.id, session.permissions)

    // First bytes at once
    return openStream(request, LIVE_TOPICS.live(params.id), ': open\n\n')
  },
})
