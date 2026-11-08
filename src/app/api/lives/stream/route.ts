import { createStreamRoute } from '@/core/lib/http/route'
import { liveStreamOf } from '@/core/lib/lives/stream'
import { LIVE_STREAM_EVENTS, LIVE_TOPICS } from '@/declarations/lives/topics'
import { Permissions } from '@/utils/constants/permissions'

// Each status change reaches the browser as one event
const openStream = liveStreamOf(
  (payload) => `event: ${LIVE_STREAM_EVENTS.status}\ndata: ${JSON.stringify(payload)}\n\n`
)

export const GET = createStreamRoute({
  permission: Permissions.LiveRead,
  rateLimit: false,
  descriptor: { summary: 'Follow live status changes', tags: ['lives'] },
  open: async ({ request, scope }) => {
    const perimeter = await scope()

    // Only lives of the perimeter
    return openStream(request, LIVE_TOPICS.lives, {
      accept: (payload) =>
        perimeter.isGlobal ||
        perimeter.youtuberIds.includes((payload as { youtuberId?: string }).youtuberId ?? ''),
    })
  },
})
