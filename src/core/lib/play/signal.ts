import 'server-only'

import { publishLive } from '@/core/lib/lives/bus'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'

/**
 * Tell a game's players to read it again
 * @param {string} sessionId - Game
 * @param {boolean} [lobby] - Lobby list moved too
 * @param {boolean} [isBoardOnly] - Only the board to read
 * @return {Promise<void>} - Sent
 */

export const signalPlay = async (
  sessionId: string,
  lobby = false,
  isBoardOnly = false
): Promise<void> => {
  const type = isBoardOnly ? PLAY_STREAM_EVENTS.moved : PLAY_STREAM_EVENTS.changed
  const payload = { type, sessionId, at: Date.now() }
  await publishLive(PLAY_TOPICS.session(sessionId), payload)
  if (lobby) await publishLive(PLAY_TOPICS.lobbies, payload)
}
