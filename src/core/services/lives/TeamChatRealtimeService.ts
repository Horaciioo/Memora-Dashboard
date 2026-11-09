import 'server-only'

import { forbidden, invalidInput } from '@/core/lib/errors'
import { isSimulated } from '@/core/lib/auth/simulation'
import { forwardTopic } from '@/core/lib/realtime/server/frames'
import type { RealtimeRequest, RealtimeTopic } from '@/core/lib/realtime/server/types'
import { canUseTeamChat, sendTeamMessage } from '@/core/services/lives/TeamChatService'
import { VIEW_COPY } from '@/declarations/access/copy'
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
]

/**
 * Team chat requests answered over the socket
 * @type {Record<string, RealtimeRequest>}
 */

export const TEAM_CHAT_REALTIME_REQUESTS: Record<string, RealtimeRequest> = {
  [REALTIME_OPS.teamChatSend]: async (session, data) => {
    if (isSimulated(session)) throw forbidden(VIEW_COPY.simulatedBlocked)
    const { liveId, body, mentions } = (data ?? {}) as Record<string, unknown>
    if (typeof liveId !== 'string') {
      throw invalidInput([{ field: 'liveId', message: FORM_COPY.required }])
    }

    return sendTeamMessage({ liveId, session, body, mentions })
  },
}
