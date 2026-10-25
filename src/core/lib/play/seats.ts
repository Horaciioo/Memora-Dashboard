import { PLAY_SETTINGS } from '@/declarations/play/settings'

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
