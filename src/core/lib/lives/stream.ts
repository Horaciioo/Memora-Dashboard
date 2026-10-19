import 'server-only'

import { subscribeLive } from '@/core/lib/lives/bus'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

const encoder = new TextEncoder()

// Comment line for proxies
const KEEP_ALIVE = encoder.encode(': keep-alive\n\n')

// Bytes queued before backpressure
const HIGH_WATER_BYTES = 64 * 1024

/**
 * Event stream factory, one frame per signal
 * @param {(payload: unknown) => string} write - Frame text
 * @return {(request: Request, topic: string, opening?: string) => ReadableStream<Uint8Array>} - Opener
 */

export const liveStreamOf = (write: (payload: unknown) => string) => {
  // Encoded once for every reader
  const frames = new WeakMap<object, Uint8Array>()
  const frameOf = (payload: unknown): Uint8Array => {
    if (typeof payload !== 'object' || payload === null) return encoder.encode(write(payload))

    const known = frames.get(payload)
    if (known) return known
    const frame = encoder.encode(write(payload))
    frames.set(payload, frame)

    return frame
  }

  return (request: Request, topic: string, opening?: string): ReadableStream<Uint8Array> => {
    let release = () => {}

    return new ReadableStream<Uint8Array>(
      {
        start: (controller) => {
          let isOpen = true
          const lag = -LIVE_SETTINGS.feedSlowKilobytes * 1024
          const end = (failed: boolean) => {
            if (!isOpen) return
            isOpen = false
            release()
            if (failed) controller.error(new Error('slow reader'))
            else controller.close()
          }
          const send = (chunk: Uint8Array) => {
            if (!isOpen) return
            // A reader this far behind reconnects
            if ((controller.desiredSize ?? 0) < lag) end(true)
            else controller.enqueue(chunk)
          }

          if (opening) send(encoder.encode(opening))
          const unsubscribe = subscribeLive(topic, (payload) => send(frameOf(payload)))
          const keepAlive = setInterval(
            () => send(KEEP_ALIVE),
            LIVE_SETTINGS.streamKeepAliveSeconds * 1000
          )

          release = () => {
            clearInterval(keepAlive)
            unsubscribe()
          }

          // Browser gone
          request.signal.addEventListener('abort', () => end(false))
        },
        cancel: () => release(),
      },
      new ByteLengthQueuingStrategy({ highWaterMark: HIGH_WATER_BYTES })
    )
  }
}
