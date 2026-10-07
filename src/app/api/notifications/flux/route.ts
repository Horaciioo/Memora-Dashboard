import { createStreamRoute } from '@/core/lib/http/route'
import { subscribeLive } from '@/core/lib/lives/bus'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import {
  NOTIFICATION_STREAM_EVENTS,
  NOTIFICATION_TOPICS,
} from '@/declarations/notifications/topics'

const encoder = new TextEncoder()

export const GET = createStreamRoute({
  rateLimit: false,
  descriptor: { summary: 'Receive my notifications as they arrive', tags: ['notifications'] },
  open: async ({ request, session }) => {
    let release = () => {}

    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        const send = (chunk: string) => controller.enqueue(encoder.encode(chunk))

        // Only what is addressed to this member crosses the stream
        const unsubscribe = subscribeLive(NOTIFICATION_TOPICS.fresh, (payload) => {
          const { recipientId, entry } = payload as { recipientId: string; entry: unknown }
          if (recipientId !== session.id) return

          send(`event: ${NOTIFICATION_STREAM_EVENTS.fresh}\ndata: ${JSON.stringify(entry)}\n\n`)
        })

        // Comment lines keep proxies from closing an idle stream
        const keepAlive = setInterval(
          () => send(': keep-alive\n\n'),
          LIVE_SETTINGS.streamKeepAliveSeconds * 1000
        )

        release = () => {
          clearInterval(keepAlive)
          unsubscribe()
        }

        // Browser gone
        request.signal.addEventListener('abort', () => {
          release()
          controller.close()
        })
      },
      cancel: () => release(),
    })
  },
})
