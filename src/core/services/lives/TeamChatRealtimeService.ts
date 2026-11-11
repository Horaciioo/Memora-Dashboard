import 'server-only'

import { forbidden, invalidInput } from '@/core/lib/errors'
import { isSimulated } from '@/core/lib/auth/simulation'
import { forwardTopic } from '@/core/lib/realtime/server/frames'
import type { RealtimeRequest, RealtimeTopic } from '@/core/lib/realtime/server/types'
import {
  canUseScope,
  canUseTeamChat,
  sendTeamMessage,
  signalTyping,
  toggleReaction,
} from '@/core/services/lives/TeamChatService'
import { VIEW_COPY } from '@/declarations/access/copy'
import { TEAM_CHAT_SCOPES } from '@/declarations/lives/teamChat'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { REALTIME_OPS } from '@/declarations/system/realtime'

/**
 * Team chat topic, convened members only
 * @type {RealtimeTopic[]}
 */

export const TEAM_CHAT_REALTIME_TOPICS: RealtimeTopic[] = [
  {
    match: (topic) => LIVE_TOPICS.teamLiveIdOf(topic) !== null,
    open: async (topic, connection) => {
      const liveId = LIVE_TOPICS.teamLiveIdOf(topic) ?? ''
      if (!(await canUseTeamChat(liveId, connection.session))) throw forbidden()

      return forwardTopic(topic, connection)
    },
  },
  {
    match: (topic) => LIVE_TOPICS.scopedOf(topic) !== null,
    open: async (topic, connection) => {
      const room = LIVE_TOPICS.scopedOf(topic)
      const scope = TEAM_CHAT_SCOPES.find((known) => known === room?.scope)
      if (!room || !scope || !(await canUseScope(room.liveId, connection.session, scope))) {
        throw forbidden()
      }

      return forwardTopic(topic, connection)
    },
  },
]

// Live named by a request, or refused
const liveIdOf = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw invalidInput([{ field: 'liveId', message: FORM_COPY.required }])
  }

  return value
}

/**
 * Team chat requests answered over the socket
 * @type {Record<string, RealtimeRequest>}
 */

export const TEAM_CHAT_REALTIME_REQUESTS: Record<string, RealtimeRequest> = {
  [REALTIME_OPS.teamChatSend]: async (session, data) => {
    if (isSimulated(session)) throw forbidden(VIEW_COPY.simulatedBlocked)
    const { liveId, body, mentions, scope } = (data ?? {}) as Record<string, unknown>

    return sendTeamMessage({ liveId: liveIdOf(liveId), session, body, mentions, scope })
  },
  [REALTIME_OPS.teamChatTyping]: async (session, data) => {
    if (isSimulated(session)) return null
    const { liveId, scope } = (data ?? {}) as Record<string, unknown>
    await signalTyping({ liveId: liveIdOf(liveId), session, scope })

    return null
  },
  [REALTIME_OPS.teamChatReact]: async (session, data) => {
    if (isSimulated(session)) throw forbidden(VIEW_COPY.simulatedBlocked)
    const { liveId, messageId, emoji } = (data ?? {}) as Record<string, unknown>
    await toggleReaction({ liveId: liveIdOf(liveId), session, messageId, emoji })

    return null
  },
}
