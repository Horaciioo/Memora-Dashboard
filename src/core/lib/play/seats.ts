import type { Prisma } from '@prisma/client'

import { navalSeatsOf } from '@/core/lib/play/naval/settings'
import { PLAY_GAMES } from '@/declarations/play/games'
import { PLAY_SETTINGS } from '@/declarations/play/settings'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Colour key of a seat
 * @param {number} index - Palette slot
 * @return {string} - Colour key
 */

export const seatColorKey = (index: number): string => `seat-${index + 1}`

/**
 * Random colour no other player wears
 * @param {string[]} taken - Colours in use
 * @param {() => number} [random] - Random source
 * @return {string} - Colour key
 */

export const pickSeatColor = (taken: string[], random: () => number = Math.random): string => {
  const used = new Set(taken)
  const free = Array.from({ length: PLAY_SETTINGS.seatColors }, (_, index) =>
    seatColorKey(index)
  ).filter((key) => !used.has(key))

  return free[Math.floor(random() * free.length)] ?? seatColorKey(used.size)
}

/**
 * Seats a table accepts, a mode may narrow the game
 * @param {PlayGameName} game - Game
 * @param {Prisma.JsonValue} settings - Table settings
 * @return {{ min: number; max: number }} - Bounds
 */

export const seatBoundsOf = (
  game: PlayGameName,
  settings: Prisma.JsonValue
): { min: number; max: number } => {
  if (game === PlayGames.Naval) return navalSeatsOf(settings)
  const { minPlayers, maxPlayers } = PLAY_GAMES.get(game)

  return { min: minPlayers, max: maxPlayers }
}
