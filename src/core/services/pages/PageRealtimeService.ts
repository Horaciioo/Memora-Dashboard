import 'server-only'

import { subscribeLive } from '@/core/lib/lives/bus'
import { levelAllows } from '@/core/lib/pages'
import { joinDoc, setDocWrite } from '@/core/lib/realtime/server/docs'
import { eventFrame, forwardTopic } from '@/core/lib/realtime/server/frames'
import { joinPresence } from '@/core/lib/realtime/server/presence'
import type { RealtimeConnection, RealtimeTopic } from '@/core/lib/realtime/server/types'
import { requirePage } from '@/core/services/pages/AccessService'
import { viewerOf } from '@/core/services/pages/lookups'
import { pageDocStore } from '@/core/services/pages/PageDocService'
import { PAGE_STREAM_EVENTS, PAGE_TOPICS } from '@/declarations/pages/topics'

/**
 * Level of a socket on a page, throws when closed
 * @param {string} topic - Page topic
 * @param {RealtimeConnection} connection - Socket
 * @return {Promise<Awaited<ReturnType<typeof requirePage>>>} - Reached page
 */

const reach = (topic: string, connection: RealtimeConnection) =>
  requirePage(PAGE_TOPICS.pageIdOf(topic), viewerOf(connection.session), 'read')

/**
 * Page topics a socket can follow, read access checked, checked again on every share move
 * @type {RealtimeTopic[]}
 */

export const PAGE_REALTIME_TOPICS: RealtimeTopic[] = [
  {
    match: (topic) => PAGE_TOPICS.pageIdOf(topic) !== null,
    open: async (topic, connection) => {
      const { page, level } = await reach(topic, connection)

      const stops = [
        forwardTopic(topic, connection),
        joinPresence(topic, connection),
        await joinDoc(topic, connection, {
          canWrite: levelAllows(level, 'write'),
          store: pageDocStore(page.id),
        }),
      ]
      const stop = () => stops.splice(0).forEach((leave) => leave())

      // Shares moved: same seat, new rights, or out
      stops.push(
        subscribeLive(PAGE_TOPICS.access, () => {
          reach(topic, connection).then(
            (reached) => setDocWrite(topic, connection, levelAllows(reached.level, 'write')),
            () => {
              stop()
              connection.send(eventFrame(topic, PAGE_STREAM_EVENTS.access, null))
            }
          )
        })
      )

      return stop
    },
  },
]
