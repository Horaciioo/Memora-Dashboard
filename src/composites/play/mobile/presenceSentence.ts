import { PlayPlaceStates } from '@/core/lib/play/presenceState'
import { fillPlayMessage, PLAY_GAMES, PLAY_MOBILE_COPY } from '@/declarations/play'
import type { PlayPlaceState } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Sentence of what a player does
 * @param {PlayPlaceState['state'] | undefined} state - Playing or watching, none in the hub
 * @param {PlayGameName | null} game - Game when listed
 * @return {string} - "Joue à …", "Regarde une partie", or the hub
 */

export const presenceSentence = (
  state: PlayPlaceState['state'] | undefined,
  game: PlayGameName | null
): string => {
  if (state === PlayPlaceStates.Watching) return PLAY_MOBILE_COPY.onlineWatching
  if (state !== PlayPlaceStates.Playing) return PLAY_MOBILE_COPY.onlineIdle

  return game
    ? fillPlayMessage(PLAY_MOBILE_COPY.onlineIn, { game: PLAY_GAMES.label(game) })
    : PLAY_MOBILE_COPY.onlinePlaying
}
