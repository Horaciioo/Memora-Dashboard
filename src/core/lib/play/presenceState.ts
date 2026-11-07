import type { PlayPlaceState } from '@/types/play'

/**
 * How a member stands in Play
 * @type {{ Playing: 'playing', Watching: 'watching' }}
 */

export const PlayPlaceStates = {
  Playing: 'playing',
  Watching: 'watching',
} as const

// Separates the state from the game
const SEPARATOR = ':'

/**
 * Place a tab reports in the Play room
 * @param {PlayPlaceState['state']} state - Seated or watching
 * @param {string} sessionId - Game
 * @return {string} - Reported place
 */

export const writePlayPlace = (state: PlayPlaceState['state'], sessionId: string): string =>
  `${state}${SEPARATOR}${sessionId}`

/**
 * Read a place reported in the Play room
 * @param {string | null} place - Reported place
 * @return {PlayPlaceState | null} - State and game, null when in the hub
 */

export const readPlayPlace = (place: string | null): PlayPlaceState | null => {
  const [state, sessionId] = (place ?? '').split(SEPARATOR)
  if (!sessionId) return null
  if (state !== PlayPlaceStates.Playing && state !== PlayPlaceStates.Watching) return null

  return { state, sessionId }
}
