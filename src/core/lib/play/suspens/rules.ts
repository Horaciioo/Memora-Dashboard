import {
  fillPlayMessage,
  JUMBLE_WORDS,
  PLAY_ERRORS,
  SUSPENS_PARTS,
  SUSPENS_SETTINGS,
} from '@/declarations/play'
import { SuspensPhases } from '@/utils/constants/play'
import type { SuspensPhaseName } from '@/utils/constants/play'

/**
 * Word ready to be played
 * @typedef {Object} SuspensWord
 * @property {string} word - Capital letters without accents, what the guesses are matched with
 * @property {string} display - Written form, accents kept
 */

export interface SuspensWord {
  word: string
  display: string
}

// Letters a word may be made of
const ALPHABET = new Set(SUSPENS_SETTINGS.alphabet)

/**
 * Capital letter without accent
 * @param {string} char - Written letter
 * @return {string} - Folded letter
 */

export const foldLetter = (char: string): string =>
  char
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()

/**
 * Word as the game reads it, null when it holds something else than letters
 * @param {string} typed - Written word
 * @return {SuspensWord | null} - Word
 */

export const wordOf = (typed: string): SuspensWord | null => {
  const display = typed.trim().toLowerCase()
  const folded = Array.from(display).map(foldLetter)
  if (!folded.length || !folded.every((letter) => ALPHABET.has(letter))) return null

  return { word: folded.join(''), display }
}

/**
 * Word a setter proposes, or the reason it is refused
 * @param {string} typed - Written word
 * @param {Set<string>} known - Dictionary, lowercase unaccented words
 * @return {{ entry: SuspensWord } | { error: string }} - Word or refusal
 */

export const checkWord = (
  typed: string,
  known: Set<string>
): { entry: SuspensWord } | { error: string } => {
  const entry = wordOf(typed)
  if (!entry) return { error: PLAY_ERRORS.wordLetters }

  const { min, max } = SUSPENS_SETTINGS.wordLength
  if (entry.word.length < min || entry.word.length > max) {
    return { error: fillPlayMessage(PLAY_ERRORS.wordLength, { min, max }) }
  }

  return known.has(entry.word.toLowerCase()) ? { entry } : { error: PLAY_ERRORS.wordUnknown }
}

// Words the game may draw, inside the length bounds
const POOL: SuspensWord[] = JUMBLE_WORDS.map(wordOf).filter(
  (entry): entry is SuspensWord =>
    entry !== null &&
    entry.word.length >= SUSPENS_SETTINGS.wordLength.min &&
    entry.word.length <= SUSPENS_SETTINGS.wordLength.max
)

/**
 * Unplayed word drawn by the game
 * @param {Set<string>} used - Capital words already played
 * @param {() => number} [random] - Source in [0, 1)
 * @return {SuspensWord} - Word
 */

export const drawWord = (used: Set<string>, random: () => number = Math.random): SuspensWord => {
  const fresh = POOL.filter(({ word }) => !used.has(word))
  const from = fresh.length ? fresh : POOL

  return from[Math.floor(random() * from.length)]
}

/**
 * Times a letter stands in the word
 * @param {string} word - Capital word
 * @param {string} letter - Capital letter
 * @return {number} - Cells it fills
 */

export const cellsOf = (word: string, letter: string): number =>
  Array.from(word).filter((char) => char === letter).length

/**
 * Letters hidden in the word
 * @param {string} word - Capital word
 * @param {string[]} tried - Letters tried
 * @return {number} - Cells still empty
 */

export const hiddenCells = (word: string, tried: string[]): number =>
  Array.from(word).filter((char) => !tried.includes(char)).length

/**
 * Cells of the word as the guessers see them
 * @param {string} word - Capital word
 * @param {string} display - Written word
 * @param {string[]} tried - Letters tried
 * @return {(string | null)[]} - Capital letter with its accent, null while hidden
 */

export const maskOf = (word: string, display: string, tried: string[]): (string | null)[] =>
  Array.from(display).map((char, index) =>
    tried.includes(word[index]) ? char.toUpperCase() : null
  )

/**
 * Letters tried that the word does not hold
 * @param {string} word - Capital word
 * @param {string[]} tried - Letters tried
 * @return {string[]} - Wrong letters, in the order tried
 */

export const wrongLetters = (word: string, tried: string[]): string[] =>
  tried.filter((letter) => !word.includes(letter))

/**
 * Parts of the drawing on screen: the gallows pre-drawn when fewer errors are allowed
 * @param {number} errors - Errors made
 * @param {number} allowed - Errors before the hanging
 * @return {number} - Parts shown
 */

export const partsShown = (errors: number, allowed: number): number =>
  Math.min(SUSPENS_PARTS.length, SUSPENS_PARTS.length - allowed + errors)

/**
 * Points of a find
 * @param {number} cells - Cells uncovered
 * @param {boolean} isSolve - The word is complete
 * @return {number} - Points
 */

export const findPoints = (cells: number, isSolve: boolean): number =>
  cells * SUSPENS_SETTINGS.scoring.cell + (isSolve ? SUSPENS_SETTINGS.scoring.solve : 0)

/**
 * Points of the setter for a round
 * @param {number} errors - Errors the guessers made
 * @param {boolean} isHanged - The figure was hanged
 * @return {number} - Points
 */

export const setterPoints = (errors: number, isHanged: boolean): number =>
  errors * SUSPENS_SETTINGS.scoring.setterPerError +
  (isHanged ? SUSPENS_SETTINGS.scoring.setterHang : 0)

/**
 * Setter of a round: the next of the order still seated
 * @param {string[]} order - Setters in turn
 * @param {number} round - Round, from one
 * @param {string[]} seated - Players still at the table
 * @return {string} - Setter
 */

export const setterOf = (order: string[], round: number, seated: string[]): string => {
  for (let step = 0; step < order.length; step += 1) {
    const candidate = order[(round - 1 + step) % order.length]
    if (seated.includes(candidate)) return candidate
  }

  return seated[0] ?? order[0]
}

/**
 * Guesser after another, the setter and those who left skipped
 * @param {string[]} order - Players in turn
 * @param {string} setterId - Setter of the round
 * @param {string[]} seated - Players still at the table
 * @param {string | null} [from] - Guesser who just played, none at the start of a round
 * @return {string | null} - Next guesser, none when nobody is left to guess
 */

export const nextGuesser = (
  order: string[],
  setterId: string,
  seated: string[],
  from: string | null = null
): string | null => {
  const start = from === null ? order.indexOf(setterId) : order.indexOf(from)
  for (let step = 1; step <= order.length; step += 1) {
    const candidate = order[(Math.max(start, 0) + step) % order.length]
    if (candidate !== setterId && seated.includes(candidate)) return candidate
  }

  return null
}

/**
 * Phase a round is in
 * @param {{ word: string | null, revealUntil: Date | string | null }} game - Table
 * @return {SuspensPhaseName} - Phase
 */

export const phaseOf = (game: {
  word: string | null
  revealUntil: Date | string | null
}): SuspensPhaseName => {
  if (game.revealUntil) return SuspensPhases.Reveal

  return game.word === null ? SuspensPhases.Pick : SuspensPhases.Play
}
