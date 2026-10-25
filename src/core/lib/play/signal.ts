import 'server-only'

import { publishLive } from '@/core/lib/lives/bus'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'

/**
 * Tell a game's players to read it again
 * @param {string} sessionId - Game
 * @param {boolean} [lobby] - Lobby list moved too
 * @return {Promise<void>} - Sent
 */

export const signalPlay = async (sessionId: string, lobby = false): Promise<void> => {
  const payload = { type: PLAY_STREAM_EVENTS.changed, sessionId, at: Date.now() }
  await publishLive(PLAY_TOPICS.session(sessionId), payload)
  if (lobby) await publishLive(PLAY_TOPICS.lobbies, payload)
}
