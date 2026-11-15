import 'server-only'

import { forbidden } from '@/core/lib/errors'
import { forwardTopic } from '@/core/lib/realtime/server/frames'
import type { RealtimeTopic } from '@/core/lib/realtime/server/types'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { UNBAN_SIGNAL } from '@/declarations/system/signals'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Change signal of Deban., only for members who read the requests
 * @type {RealtimeTopic[]}
 */

export const UNBAN_REALTIME_TOPICS: RealtimeTopic[] = [
  {
    match: (topic) => topic === UNBAN_SIGNAL.topic,
    open: async (topic, connection) => {
      if (!resolvePermissions(connection.session).can(Permissions.UnbanRead)) throw forbidden()

      return forwardTopic(topic, connection)
    },
  },
]
