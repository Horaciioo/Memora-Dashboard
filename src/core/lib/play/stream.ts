import 'server-only'

import { liveStreamOf } from '@/core/lib/lives/stream'
import { PLAY_STREAM_EVENTS } from '@/declarations/play/topics'

/**
 * Play event stream, one frame per change
 * @type {ReturnType<typeof liveStreamOf>}
 */

export const playStream = liveStreamOf(
  (payload) => `event: ${PLAY_STREAM_EVENTS.changed}\ndata: ${JSON.stringify(payload)}\n\n`
)
