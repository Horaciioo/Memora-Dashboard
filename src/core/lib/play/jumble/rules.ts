import { normalizeWord } from '@/core/lib/play/baccalaureat/words'
import { JUMBLE_SETTINGS, JUMBLE_WORDS } from '@/declarations/play'
import type { JumbleLevel } from '@/declarations/play/jumble/settings'
import { SECOND_MS } from '@/utils/constants/time'
import { DATE_LOCALE } from '@/declarations/ui/dates'

/**
 * Word ready to be played
 * @typedef {Object} JumbleWord
 * @property {string} answer - Comparable form
 * @property {string} display - Written form, accents kept
 */

export interface JumbleWord {
  answer: string
  display: string
}

// Plain words inside the length bounds
const POOL: JumbleWord[] = JUMBLE_WORDS.map((display) => ({
  display,
  answer: normalizeWord(display),
})).filter(
  ({ answer }) =>
    !answer.includes(' ') &&
    answer.length >= JUMBLE_SETTINGS.lengths.min &&
    answer.length <= JUMBLE_SETTINGS.lengths.max
)

/**
 * Letters of a word in alphabet order, equal for anagrams
 * @param {string} word - Comparable word
 * @return {string} - Sorted letters
 */

export const letterKey = (word: string): string => [...word].sort().join('')

/**
 * Letters mixed fairly, never left in order nor nearly so
 * @param {string} answer - Comparable word
 * @param {() => number} [random] - Source in [0, 1)
 * @return {string} - Capital letters
 */

export const scramble = (answer: string, random: () => number = Math.random): string => {
  const source = [...answer.toUpperCase()]
  const maxFixed = Math.floor(source.length / 3)
  let mixed = source

  for (let attempt = 0; attempt < 30; attempt += 1) {
    // Fisher-Yates, unbiased
    mixed = [...source]
    for (let index = mixed.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1))
      ;[mixed[index], mixed[other]] = [mixed[other], mixed[index]]
    }

    const fixed = mixed.filter((letter, index) => letter === source[index]).length
    if (fixed <= maxFixed && mixed.join('') !== source.join('')) return mixed.join('')
  }

  return mixed.join('') !== source.join('') ? mixed.join('') : source.toReversed().join('')
}

/**
 * Time of a round, longer words get more
 * @param {number} roundSeconds - Time chosen by the host
 * @param {number} length - Letters of the word
 * @return {number} - Seconds
 */

export const roundSecondsOf = (roundSeconds: number, length: number): number => {
  const { paceLength, lengthSecondsStep, lengthSecondsFloor } = JUMBLE_SETTINGS
  const share = Math.max(lengthSecondsFloor, 1 + (length - paceLength) * lengthSecondsStep)

  return Math.round(roundSeconds * share)
}

/**
 * Word length wanted at a round, longer as the game goes
 * @param {number} round - Round, from one
 * @param {number} rounds - Rounds in the game
 * @param {JumbleLevel} [level] - Difficulty, its band of lengths
 * @return {number} - Letters
 */

export const targetLength = (
  round: number,
  rounds: number,
  level: JumbleLevel = JUMBLE_SETTINGS.difficulty
): number => {
  const { min, max } = JUMBLE_SETTINGS.difficulties[level]
  const progress = rounds > 1 ? (round - 1) / (rounds - 1) : 0

  return Math.round(min + progress * (max - min))
}

/**
 * Unplayed word close to the length of the round
 * @param {number} round - Round, from one
 * @param {number} rounds - Rounds in the game
 * @param {Set<string>} used - Comparable words already played
 * @param {JumbleLevel} [level] - Difficulty
 * @param {() => number} [random] - Source in [0, 1)
 * @return {JumbleWord} - Word
 */

export const drawWord = (
  round: number,
  rounds: number,
  used: Set<string>,
  level: JumbleLevel = JUMBLE_SETTINGS.difficulty,
  random: () => number = Math.random
): JumbleWord => {
  const target = targetLength(round, rounds, level)
  const band = JUMBLE_SETTINGS.difficulties[level]
  const fresh = POOL.filter(({ answer }) => !used.has(answer))
  const pool = fresh.length ? fresh : POOL

  // One letter of play around the target, kept in the level
  const varied = pool.filter(
    ({ answer }) =>
      Math.abs(answer.length - target) <= 1 &&
      answer.length >= band.min &&
      answer.length <= band.max
  )
  if (varied.length) return varied[Math.floor(random() * varied.length)]

  // Widen the band until a word fits
  for (let reach = 0; reach <= JUMBLE_SETTINGS.lengths.max; reach += 1) {
    const close = pool.filter(({ answer }) => Math.abs(answer.length - target) <= reach)
    if (close.length) return close[Math.floor(random() * close.length)]
  }

  return pool[0]
}

/**
 * Word hiding behind a mix of letters
 * @param {string} scrambled - Mixed letters
 * @return {JumbleWord | undefined} - Word
 */

export const wordOfLetters = (scrambled: string): JumbleWord | undefined => {
  const key = letterKey(scrambled.toLowerCase())

  return POOL.find(({ answer }) => letterKey(answer) === key)
}

/**
 * Guess that solves the round: the word, or another real word with the same letters
 * @param {string} guess - Comparable guess
 * @param {string} answer - Comparable answer
 * @param {Set<string>} known - Dictionary
 * @return {boolean} - Solved
 */

export const isSolution = (guess: string, answer: string, known: Set<string>): boolean =>
  guess === answer || (letterKey(guess) === letterKey(answer) && known.has(guess))

/**
 * Points of a solved round
 * @param {Object} input - Round
 * @param {number} input.elapsedMs - Time since the round opened
 * @param {number} input.totalMs - Time of the round
 * @param {number} input.streak - Rounds won in a row, this one included
 * @param {number} input.length - Letters of the word
 * @return {{ points: number, isFlash: boolean }} - Points and the flash mark
 */

export const pointsOf = ({
  elapsedMs,
  totalMs,
  streak,
  length,
}: {
  elapsedMs: number
  totalMs: number
  streak: number
  length: number
}): { points: number; isFlash: boolean } => {
  const {
    base,
    speedBonus,
    flashRatio,
    flashBonus,
    streakStep,
    streakMax,
    lengthBonus,
    lengthFrom,
  } = JUMBLE_SETTINGS.scoring
  const left = Math.min(1, Math.max(0, 1 - elapsedMs / totalMs))
  const isFlash = elapsedMs / totalMs <= flashRatio
  const run = Math.min(Math.max(streak - 1, 0), streakMax) * streakStep
  const size = Math.max(length - lengthFrom, 0) * lengthBonus

  return {
    points: base + Math.round(speedBonus * left) + (isFlash ? flashBonus : 0) + run + size,
    isFlash,
  }
}

/**
 * Time of an answer with one decimal, French style
 * @param {number} ms - Milliseconds
 * @return {string} - Seconds
 */

export const secondsLabel = (ms: number): string =>
  (ms / SECOND_MS).toLocaleString(DATE_LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
