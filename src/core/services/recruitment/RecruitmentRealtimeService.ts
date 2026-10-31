import 'server-only'

import { forbidden } from '@/core/lib/errors'
import { forwardTopic } from '@/core/lib/realtime/server/frames'
import type { RealtimeTopic } from '@/core/lib/realtime/server/types'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { readScope } from '@/core/services/auth/ScopeService'
import { recruitmentModeOf } from '@/core/services/recruitment/access'
import { reachableSession } from '@/core/services/recruitment/reach'
import { RECRUITMENT_TOPICS } from '@/declarations/recruitment/topics'

/**
 * Recruitment topics a socket can follow, the page's own guard applied again
 * @type {RealtimeTopic[]}
 */

export const RECRUITMENT_REALTIME_TOPICS: RealtimeTopic[] = [
  {
    match: (topic) => RECRUITMENT_TOPICS.sessionIdOf(topic) !== null,
    open: async (topic, connection) => {
      const sessionId = RECRUITMENT_TOPICS.sessionIdOf(topic) ?? ''
      const { session } = connection
      const access = resolvePermissions(session)
      const mode = await recruitmentModeOf(access, session.id, sessionId)

      if (!mode) throw forbidden()
      // A reader stays inside the creators of their perimeter
      if (mode === 'read') {
        await reachableSession(sessionId, await readScope(session, access)).catch(() => {
          throw forbidden()
        })
      }

      return forwardTopic(topic, connection)
    },
  },
]
