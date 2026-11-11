import 'server-only'

import { conflict } from '@/core/lib/errors'
import { disconnectSocket, readHubSnapshot } from '@/core/lib/realtime/server'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { REALTIME_COPY } from '@/declarations/nexus/modulesCopy'

const topics: NexusHandler = async () => ({
  output: Object.entries(readHubSnapshot().topics)
    .sort(([, a], [, b]) => b - a)
    .map(([topic, subscribers]) => ({ topic, subscribers })),
  data: { note: REALTIME_COPY.perProcess },
})

const topic: NexusHandler = async (context) => {
  const name = String(context.args.name)
  const snapshot = readHubSnapshot()
  const followers = snapshot.sockets.filter((socket) => socket.topics.includes(name))
  if (followers.length === 0) throw conflict(REALTIME_COPY.topicMissing)

  return {
    output: {
      topic: name,
      subscribers: followers.length,
      framesPerSecond: Number(
        followers.reduce((sum, row) => sum + row.framesPerSecond, 0).toFixed(2)
      ),
      bufferedKilobytes: followers.reduce((sum, row) => sum + row.bufferedKilobytes, 0),
    },
  }
}

const disconnect: NexusHandler = async (context) => {
  const socket = String(context.args.socket)
  const found = readHubSnapshot().sockets.some((row) => row.id === socket)
  if (!found) throw conflict(REALTIME_COPY.socketMissing)
  if (context.dryRun) return { output: { socket, action: 'fermer proprement' }, level: 'warning' }

  disconnectSocket(socket)

  return {
    output: { socket, action: 'fermée, le client se reconnecte' },
    target: `socket:${socket}`,
    level: 'warning',
  }
}

/**
 * Topic reads and socket close
 * @type {Record<string, NexusHandler>}
 */

export const TOPIC_HANDLERS: Record<string, NexusHandler> = {
  'realtime.topics': topics,
  'realtime.topic': topic,
  'realtime.disconnect': disconnect,
}
