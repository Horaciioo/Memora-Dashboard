import 'server-only'

import { forbidden } from '@/core/lib/errors'
import { joinPresence } from '@/core/lib/realtime/server/presence'
import type { RealtimeTopic } from '@/core/lib/realtime/server/types'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { SECTION_TOPICS } from '@/declarations/system/sections'

/**
 * Section rooms, the section's own permission checked
 * @type {RealtimeTopic[]}
 */

export const SECTION_REALTIME_TOPICS: RealtimeTopic[] = [
  {
    match: (topic) => SECTION_TOPICS.sectionOf(topic) !== null,
    open: async (topic, connection) => {
      const section = SECTION_TOPICS.sectionOf(topic)
      if (!section || !resolvePermissions(connection.session).canAny(section.permissions)) {
        throw forbidden()
      }

      return joinPresence(topic, connection)
    },
  },
]
