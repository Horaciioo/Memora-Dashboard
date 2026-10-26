import 'server-only'

import { liveStreamOf } from '@/core/lib/lives/stream'
import { PLAY_STREAM_EVENTS } from '@/declarations/play/topics'

/**
 * Play event stream, one frame per change
 * @type {ReturnType<typeof liveStreamOf>}
 */

export const playStream = liveStreamOf((payload) => {
  const type = (payload as { type?: unknown } | null)?.type
  const event = type === PLAY_STREAM_EVENTS.moved ? type : PLAY_STREAM_EVENTS.changed

  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
})
