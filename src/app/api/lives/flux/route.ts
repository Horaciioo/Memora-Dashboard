import { createStreamRoute } from '@/core/lib/http/route'
import { subscribeLive } from '@/core/lib/lives/bus'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_STREAM_EVENTS, LIVE_TOPICS } from '@/declarations/lives/topics'
import { Permissions } from '@/utils/constants/permissions'

const encoder = new TextEncoder()

export const GET = createStreamRoute({
  permission: Permissions.LiveRead,
  rateLimit: false,
  descriptor: { summary: 'Follow live status changes', tags: ['lives'] },
  open: async ({ request }) => {
    let release = () => {}

    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        const send = (chunk: string) => controller.enqueue(encoder.encode(chunk))

        // Each status change reaches the browser as one event
        const unsubscribe = subscribeLive(LIVE_TOPICS.lives, (payload) => {
          send(`event: ${LIVE_STREAM_EVENTS.status}\ndata: ${JSON.stringify(payload)}\n\n`)
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
