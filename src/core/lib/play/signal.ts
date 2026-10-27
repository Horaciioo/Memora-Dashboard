import 'server-only'

import { publishLive } from '@/core/lib/lives/bus'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'
import type { PlayMessageView } from '@/types/play'

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

/**
 * Hand a new chat line to a game's readers
 * @param {string} sessionId - Game
 * @param {PlayMessageView} message - Line
 * @return {Promise<void>} - Sent
 */

export const signalChat = async (sessionId: string, message: PlayMessageView): Promise<void> => {
  await publishLive(PLAY_TOPICS.session(sessionId), {
    type: PLAY_STREAM_EVENTS.chat,
    sessionId,
    message,
  })
}

/**
 * Tell members their invitations moved
 * @param {string[] | null} inviteeIds - Members, null for all of Memora
 * @return {Promise<void>} - Sent
 */

export const signalInvites = async (inviteeIds: string[] | null): Promise<void> => {
  await publishLive(PLAY_TOPICS.invites, {
    type: PLAY_STREAM_EVENTS.changed,
    inviteeIds,
    at: Date.now(),
  })
}
