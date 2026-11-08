import { createStreamRoute } from '@/core/lib/http/route'
import { liveStreamOf } from '@/core/lib/lives/stream'
import {
  NOTIFICATION_STREAM_EVENTS,
  NOTIFICATION_TOPICS,
} from '@/declarations/notifications/topics'

// One notification per signal
interface FreshSignal {
  recipientId: string
  entry: unknown
}

// Entry only crosses the stream
const openStream = liveStreamOf(
  (payload) =>
    `event: ${NOTIFICATION_STREAM_EVENTS.fresh}\ndata: ${JSON.stringify((payload as FreshSignal).entry)}\n\n`
)

export const GET = createStreamRoute({
  rateLimit: false,
  descriptor: { summary: 'Receive my notifications as they arrive', tags: ['notifications'] },
  open: async ({ request, session }) =>
    // Only what is addressed to this member
    openStream(request, NOTIFICATION_TOPICS.fresh, {
      accept: (payload) => (payload as FreshSignal).recipientId === session.id,
    }),
})
