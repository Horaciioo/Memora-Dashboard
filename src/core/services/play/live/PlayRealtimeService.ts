import 'server-only'

import { isSimulated } from '@/core/lib/auth/simulation'
import { conflict, forbidden } from '@/core/lib/errors'
import { forwardTopic } from '@/core/lib/realtime/server/frames'
import type {
  RealtimeConnection,
  RealtimeRequest,
  RealtimeTopic,
} from '@/core/lib/realtime/server/types'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { actInSession } from '@/core/services/play/GameService'
import { joinPlayRoom } from '@/core/services/play/live/PlayRoomService'
import { VIEW_COPY } from '@/declarations/access/copy'
import { PLAY_ERRORS } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { REALTIME_OPS } from '@/declarations/system/realtime'
import type { SessionUser } from '@/types/auth'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Refuse a member without Play
 * @param {SessionUser} session - Member
 * @return {void}
 */

const requirePlay = (session: SessionUser): void => {
  if (!resolvePermissions(session).can(Permissions.PlayAccess)) throw forbidden()
}

/**
 * Signal meant for a member
 * @param {unknown} payload - Signal
 * @param {string} accountId - Member
 * @return {boolean} - Let through
 */

const isFor = (payload: unknown, accountId: string): boolean => {
  const ids = (payload as { inviteeIds?: unknown } | null)?.inviteeIds

  return !Array.isArray(ids) || ids.includes(accountId)
}

/**
 * Topic guarded by Play
 * @param {(topic: string) => boolean} match - Handles this topic
 * @param {(topic: string, connection: RealtimeConnection) => Promise<() => void> | (() => void)} open - Follow it
 * @return {RealtimeTopic} - Topic
 */

const playTopic = (
  match: (topic: string) => boolean,
  open: (topic: string, connection: RealtimeConnection) => Promise<() => void> | (() => void)
): RealtimeTopic => ({
  match,
  open: async (topic, connection) => {
    requirePlay(connection.session)

    return open(topic, connection)
  },
})

/**
 * Play topics a socket can follow
 * @type {RealtimeTopic[]}
 */

export const PLAY_REALTIME_TOPICS: RealtimeTopic[] = [
  playTopic(
    (topic) => topic === PLAY_TOPICS.lobbies,
    (topic, connection) => forwardTopic(topic, connection)
  ),
  playTopic(
    (topic) => topic === PLAY_TOPICS.invites,
    (topic, connection) =>
      forwardTopic(topic, connection, (payload) => isFor(payload, connection.session.id))
  ),
  playTopic(
    (topic) => PLAY_TOPICS.sessionIdOf(topic) !== null,
    (topic, connection) => joinPlayRoom(PLAY_TOPICS.sessionIdOf(topic) ?? '', connection)
  ),
]

/**
 * Play requests answered over the socket
 * @type {Record<string, RealtimeRequest>}
 */

export const PLAY_REALTIME_REQUESTS: Record<string, RealtimeRequest> = {
  // A move without the HTTP round of auth
  [REALTIME_OPS.playAct]: async (session, data) => {
    requirePlay(session)
    if (isSimulated(session)) throw forbidden(VIEW_COPY.simulatedBlocked)
    const { sessionId, body } = (data ?? {}) as { sessionId?: unknown; body?: unknown }
    if (typeof sessionId !== 'string' || typeof body !== 'object' || body === null) {
      throw conflict(PLAY_ERRORS.unknownAction)
    }
    await actInSession(sessionId, session.id, body as Record<string, unknown>)

    return null
  },
}
