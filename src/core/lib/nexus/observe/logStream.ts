import 'server-only'

import { OBSERVABILITY } from '@/core/lib/nexus/observe/registry'

const encoder = new TextEncoder()

// Beat that looks for new lines
const POLL_MS = 1000

/**
 * Stream new technical lines to the console window
 * @param {Request} request - Open request, its abort ends the stream
 * @param {{ level?: string, grep?: string }} filter - Lines wanted
 * @return {ReadableStream<Uint8Array>} - Event stream
 */

export const streamLogs = (
  request: Request,
  filter: { level?: string; grep?: string }
): ReadableStream<Uint8Array> => {
  let timer: ReturnType<typeof setInterval> | undefined

  return new ReadableStream<Uint8Array>({
    start: (controller) => {
      let since = Date.now()

      timer = setInterval(() => {
        const lines = OBSERVABILITY.logs.read({ ...filter, since })
        if (lines.length === 0) {
          controller.enqueue(encoder.encode(': keep-alive\n\n'))
          return
        }
        since = lines.at(-1)!.at + 1
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(lines)}\n\n`))
      }, POLL_MS)

      request.signal.addEventListener('abort', () => {
        clearInterval(timer)
        controller.close()
      })
    },
    cancel: () => clearInterval(timer),
  })
}
