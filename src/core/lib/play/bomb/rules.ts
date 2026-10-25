import { normalizeWord } from '@/core/lib/play/baccalaureat/words'
import type { BombMissReason } from '@/declarations/play'

/**
 * Seat as the turn order reads it
 * @typedef {Object} BombSeat
 */

export interface BombSeat {
  accountId: string
  order: number
  lives: number
}

/**
 * Why a word fails, null when it holds
 * @param {Object} input - Attempt
 * @param {string} input.word - Comparable word
 * @param {string} input.prompt - Syllable
 * @param {boolean} input.isKnown - In the dictionary
 * @param {boolean} input.isUsed - Played already
 * @return {BombMissReason | null} - Refusal
 */

export const missOf = ({
  word,
  prompt,
  isKnown,
  isUsed,
}: {
  word: string
  prompt: string
  isKnown: boolean
  isUsed: boolean
}): BombMissReason | null => {
  if (!word.includes(prompt)) return 'prompt'
  if (!isKnown) return 'unknown'

  return isUsed ? 'used' : null
}

/**
 * Bonus letters after a word
 * @param {string} collected - Letters gathered
 * @param {string} word - Word played
 * @param {string[]} alphabet - Bonus letters
 * @return {{ letters: string, isComplete: boolean }} - Gathered, full set
 */

export const gatherLetters = (
  collected: string,
  word: string,
  alphabet: string[]
): { letters: string; isComplete: boolean } => {
  const used = new Set([...collected, ...normalizeWord(word).toUpperCase()])
  const letters = alphabet.filter((letter) => used.has(letter))
  const isComplete = letters.length === alphabet.length

  return { letters: isComplete ? '' : letters.join(''), isComplete }
}

/**
 * Next living player after the current one
 * @param {BombSeat[]} alive - Living seats
 * @param {BombSeat | undefined} current - Seat on turn
 * @return {string | null} - Next player
 */

export const nextTurn = (
  alive: BombSeat[],
  current: { order: number } | undefined
): string | null => {
  const sorted = alive.toSorted((left, right) => left.order - right.order)
  const next = sorted.find((seat) => seat.order > (current?.order ?? -1)) ?? sorted[0]

  return next?.accountId ?? null
}

/**
 * Table left with its last survivor
 * @param {number} alive - Living players
 * @param {number} seated - Players at start
 * @return {boolean} - Game over
 */

export const isTableOver = (alive: number, seated: number): boolean => alive <= (seated > 1 ? 1 : 0)

/**
 * Random fuse length
 * @param {{ min: number, max: number }} range - Seconds
 * @return {number} - Seconds
 */

export const fuseSeconds = (range: { min: number; max: number }): number =>
  range.min + Math.random() * (range.max - range.min)
