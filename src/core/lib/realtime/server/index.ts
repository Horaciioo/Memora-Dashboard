import 'server-only'

import { logger } from '@/core/lib/logger'
import { createHub } from '@/core/lib/realtime/server/hub'
import type { RealtimeHub } from '@/core/lib/realtime/server/hub'
import {
  PLAY_REALTIME_REQUESTS,
  PLAY_REALTIME_TOPICS,
} from '@/core/services/play/live/PlayRealtimeService'

export { issueTicket } from '@/core/lib/realtime/server/tickets'
export type { RealtimeHub } from '@/core/lib/realtime/server/hub'

// Read by server.mjs on each upgrade
const globalForHub = globalThis as unknown as { memoraRealtime?: RealtimeHub }

/**
 * Open the socket hub of this process, replacing a hot reloaded one
 * @return {void}
 */

export const wireRealtime = (): void => {
  globalForHub.memoraRealtime?.close()
  globalForHub.memoraRealtime = createHub({
    topics: [...PLAY_REALTIME_TOPICS],
    requests: { ...PLAY_REALTIME_REQUESTS },
  })
  logger.info('[realtime] socket hub ready')
}
