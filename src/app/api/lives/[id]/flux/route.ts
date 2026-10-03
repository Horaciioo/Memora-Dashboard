import { createStreamRoute } from '@/core/lib/http/route'
import { subscribeLive } from '@/core/lib/lives/bus'
import { readLive } from '@/core/services/lives/LiveService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { Permissions } from '@/utils/constants/permissions'

const encoder = new TextEncoder()

export const GET = createStreamRoute({
  permission: Permissions.LiveRead,
  rateLimit: false,
  descriptor: { summary: 'Follow the Mod View feed of one live', tags: ['lives'] },
  open: async ({ request, params, session, scope }) => {
    // Only a live of the viewer's perimeter is followed
    await readLive(params.id, await scope(), session.id, session.permissions)

    let release = () => {}

    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        const send = (chunk: string) => controller.enqueue(encoder.encode(chunk))

        // First bytes at once, so the browser knows the feed is open
        send(': open\n\n')

        // Each signal names its kind, the browser routes it
        const unsubscribe = subscribeLive(LIVE_TOPICS.live(params.id), (payload) => {
          const { type, ...data } = payload as { type: string }
          send(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
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

        // Browser gone, listeners dropped
        request.signal.addEventListener('abort', () => {
          release()
          controller.close()
        })
      },
      cancel: () => release(),
    })
  },
})
