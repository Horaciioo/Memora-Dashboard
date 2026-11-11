import 'server-only'

import { logger } from '@/core/lib/logger'
import { createHub } from '@/core/lib/realtime/server/hub'
import type { HubSnapshot, RealtimeHub } from '@/core/lib/realtime/server/hub'
import { DOC_REALTIME_REQUESTS, flushDocs } from '@/core/lib/realtime/server/docs'
import { PRESENCE_REALTIME_REQUESTS } from '@/core/lib/realtime/server/presence'
import {
  TEAM_CHAT_REALTIME_REQUESTS,
  TEAM_CHAT_REALTIME_TOPICS,
} from '@/core/services/lives/TeamChatRealtimeService'
import { PAGE_REALTIME_TOPICS } from '@/core/services/pages/PageRealtimeService'
import {
  PLAY_REALTIME_REQUESTS,
  PLAY_REALTIME_TOPICS,
} from '@/core/services/play/live/PlayRealtimeService'
import { SECTION_REALTIME_TOPICS } from '@/core/services/realtime/SectionRealtimeService'
import { RECRUITMENT_REALTIME_TOPICS } from '@/core/services/recruitment/RecruitmentRealtimeService'

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
  const hub = createHub({
    topics: [
      ...PLAY_REALTIME_TOPICS,
      ...RECRUITMENT_REALTIME_TOPICS,
      ...PAGE_REALTIME_TOPICS,
      ...SECTION_REALTIME_TOPICS,
      ...TEAM_CHAT_REALTIME_TOPICS,
    ],
    requests: {
      ...PLAY_REALTIME_REQUESTS,
      ...PRESENCE_REALTIME_REQUESTS,
      ...DOC_REALTIME_REQUESTS,
      ...TEAM_CHAT_REALTIME_REQUESTS,
    },
  })
  // Open documents written before the sockets go
  globalForHub.memoraRealtime = {
    ...hub,
    close: () => {
      void flushDocs()
      hub.close()
    },
  }
  logger.info('[realtime] socket hub ready')
}

/**
 * Sockets open in this process
 * @return {number} - Open sockets
 */

export const realtimeSocketCount = (): number => globalForHub.memoraRealtime?.count() ?? 0

/**
 * Sockets and topics of this process
 * @return {HubSnapshot} - Read only picture
 */

export const readHubSnapshot = (): HubSnapshot =>
  globalForHub.memoraRealtime?.snapshot() ?? { sockets: [], topics: {} }

/**
 * Close one socket from the console
 * @param {string} socketId - Socket
 * @return {boolean} - Socket found
 */

export const disconnectSocket = (socketId: string): boolean =>
  globalForHub.memoraRealtime?.disconnect(socketId) ?? false
