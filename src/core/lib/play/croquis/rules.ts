import { normalizeWord } from '@/core/lib/play/baccalaureat/words'
import { CROQUIS_SETTINGS, CROQUIS_WORDS } from '@/declarations/play'
import type { CroquisLevel } from '@/declarations/play'

/**
 * Word ready to be played
 * @typedef {Object} CroquisWord
 * @property {string} word - Comparable form
 * @property {string} display - Written form, accents kept
 */

export interface CroquisWord {
  word: string
  display: string
}

// Articles a guess may start with
const ARTICLES = new Set(['le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd'])

/**
 * Comparable form of a word or a guess, ligatures opened
 * @param {string} text - Written text
 * @return {string} - Lowercase, unaccented, single spaced
 */

export const comparable = (text: string): string =>
  normalizeWord(text.replaceAll('œ', 'oe').replaceAll('Œ', 'oe').replaceAll('æ', 'ae'))

/**
 * Guess that finds the word: same letters, an article or the spaces ignored
 * @param {string} guess - Typed text
 * @param {string} word - Comparable answer
 * @return {boolean} - Found
 */

export const isMatch = (guess: string, word: string): boolean => {
  const typed = comparable(guess).split(' ')
  const bare = typed.length > 1 && ARTICLES.has(typed[0]) ? typed.slice(1) : typed

  return bare.join('') === word.replaceAll(' ', '') || typed.join('') === word.replaceAll(' ', '')
}

/**
 * Letters of each part of a written word, what the guessers see as slots
 * @param {string} display - Written word
 * @return {number[]} - Letters per part
 */

export const shapeOf = (display: string): number[] =>
  display
    .split(/[^\p{Letter}\p{Number}]+/u)
    .filter(Boolean)
    .map((part) => Array.from(part).length)

/**
 * Words of a level
 * @param {CroquisLevel} level - Difficulty
 * @return {CroquisWord[]} - Playable words
 */

const poolOf = (level: CroquisLevel): CroquisWord[] =>
  CROQUIS_WORDS[level].map((display) => ({ display, word: comparable(display) }))

/**
 * Unplayed word of a level
 * @param {CroquisLevel} level - Difficulty
 * @param {Set<string>} used - Comparable words already played
 * @param {() => number} [random] - Source in [0, 1)
 * @return {CroquisWord} - Word
 */

export const drawWord = (
  level: CroquisLevel,
  used: Set<string>,
  random: () => number = Math.random
): CroquisWord => {
  const pool = poolOf(level)
  const fresh = pool.filter(({ word }) => !used.has(word))
  const from = fresh.length ? fresh : pool

  return from[Math.floor(random() * from.length)]
}

/**
 * Items in a random order
 * @param {T[]} items - Items
 * @param {() => number} [random] - Source in [0, 1)
 * @return {T[]} - Shuffled copy
 */

export const shuffle = <T>(items: T[], random: () => number = Math.random): T[] => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }

  return copy
}

/**
 * Points of a player who found the word
 * @param {Object} input - Find
 * @param {number} input.elapsedMs - Time since the round opened
 * @param {number} input.totalMs - Time of the round
 * @param {number} input.rank - Place among the finders, from one
 * @return {number} - Points
 */

export const pointsOf = ({
  elapsedMs,
  totalMs,
  rank,
}: {
  elapsedMs: number
  totalMs: number
  rank: number
}): number => {
  const { base, speedBonus, firstBonus } = CROQUIS_SETTINGS.scoring
  const left = Math.min(1, Math.max(0, 1 - elapsedMs / totalMs))

  return base + Math.round(speedBonus * left) + (rank === 1 ? firstBonus : 0)
}

/**
 * Points of the drawer for a round
 * @param {number} solvers - Players who found the word
 * @param {number} guessers - Players who could find it
 * @return {number} - Points
 */

export const drawerPointsOf = (solvers: number, guessers: number): number => {
  const { drawerPerGuess, drawerAllBonus } = CROQUIS_SETTINGS.scoring
  const isAll = guessers > 0 && solvers >= guessers

  return solvers * drawerPerGuess + (isAll ? drawerAllBonus : 0)
}

/**
 * Time of an answer with one decimal, French style
 * @param {number} ms - Milliseconds
 * @return {string} - Seconds
 */

export const secondsLabel = (ms: number): string =>
  (ms / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
