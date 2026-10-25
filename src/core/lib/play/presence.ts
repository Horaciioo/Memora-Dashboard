import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import type { PlayPresence } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'

/**
 * Sentence of the game a member sits in
 * @param {PlayPresence} presence - Current game
 * @return {string} - "Joue à …"
 */

export const playPresenceLabel = (presence: PlayPresence): string =>
  fillPlayMessage(
    presence.status === PlayStatuses.Running ? PLAY_MEMBER_COPY.playing : PLAY_MEMBER_COPY.waiting,
    { game: PLAY_GAMES.label(presence.game) }
  )
