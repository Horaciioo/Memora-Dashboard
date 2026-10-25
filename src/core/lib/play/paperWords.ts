import { PLAY_PAPER } from '@/declarations/play/paper'

/**
 * Word written on a line of the squares
 * @typedef {Object} PaperNote
 * @property {string} text - Word being written, a mistake included
 * @property {string | null} fix - Right word to write again once a mistake is wiped
 * @property {number} col - First square, from 1
 * @property {number} row - Line it stands on, from 1
 * @property {number} tilt - Pen drift in degrees
 */

export interface PaperNote {
  text: string
  fix: string | null
  col: number
  row: number
  tilt: number
}

// Moments of one word
export type PenPhase = 'rest' | 'write' | 'notice' | 'hold' | 'erase'

/**
 * Pen at one instant
 * @typedef {Object} PenState
 * @property {PenPhase} phase - Moment
 * @property {PaperNote | null} note - Word on the page
 * @property {number} shown - Letters visible
 */

export interface PenState {
  phase: PenPhase
  note: PaperNote | null
  shown: number
}

/**
 * Pen before its first word
 * @type {PenState}
 */

export const PEN_START: PenState = { phase: 'rest', note: null, shown: 0 }

/**
 * Random whole number in a range
 * @param {number} min - Lowest
 * @param {number} max - Highest
 * @return {number} - Number
 */

const between = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1))

// Ways to get a word wrong
const MISTAKES: ((letters: string[], at: number) => string[])[] = [
  // Two letters swapped
  (letters, at) => letters.with(at, letters[at + 1]).with(at + 1, letters[at]),
  // A letter forgotten
  (letters, at) => letters.toSpliced(at, 1),
  // A letter doubled
  (letters, at) => letters.toSpliced(at, 0, letters[at]),
]

/**
 * Word as a hurried hand might write it
 * @param {string} word - Right spelling
 * @return {string} - Same word, wrong now and then
 */

export const misspell = (word: string): string => {
  if (word.length < 4 || Math.random() >= PLAY_PAPER.typoRate) return word

  const mistake = MISTAKES[between(0, MISTAKES.length - 1)]
  const written = mistake([...word], between(1, word.length - 2)).join('')

  return written === word ? word : written
}

/**
 * A word on a free line, away from the menu in the middle
 * @param {number} cols - Squares across
 * @param {number} rows - Squares down
 * @return {PaperNote | null} - Word, or nothing when no spot suits
 */

export const nextNote = (cols: number, rows: number): PaperNote | null => {
  const { words, marginSquares, squaresPerLetter, tilt, attempts, clear } = PLAY_PAPER
  const word = words[between(0, words.length - 1)]
  const text = misspell(word)
  const span = Math.ceil(text.length * squaresPerLetter)
  const lastCol = cols - span - 1
  if (lastCol <= marginSquares) return null

  // Squares of the clear middle, columns and rows
  const clearCols = [(cols * (1 - clear.width)) / 2, (cols * (1 + clear.width)) / 2]
  const clearRows = [(rows * (1 - clear.height)) / 2, (rows * (1 + clear.height)) / 2]

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const col = between(marginSquares + 1, lastCol)
    const row = between(2, rows - 1)
    const isClear =
      col + span > clearCols[0] && col < clearCols[1] && row > clearRows[0] && row < clearRows[1]
    if (!isClear)
      return {
        text,
        fix: text === word ? null : word,
        col,
        row,
        tilt: (Math.random() * 2 - 1) * tilt,
      }
  }

  return null
}

// What the pen does next, by moment
const NEXT: Record<PenPhase, (pen: PenState, cols: number, rows: number) => PenState> = {
  // A new word starts on a blank line
  rest: (pen, cols, rows) => {
    const note = nextNote(cols, rows)

    // No spot suits: a fresh state so the pen tries again
    return note ? { phase: 'write', note, shown: 0 } : { ...pen }
  },
  // One more letter, then a pause: on a mistake, the writer sees it
  write: (pen) => {
    const shown = pen.shown + 1
    const isDone = shown >= (pen.note?.text.length ?? 0)

    return { ...pen, shown, phase: isDone ? (pen.note?.fix ? 'notice' : 'hold') : 'write' }
  },
  notice: (pen) => ({ ...pen, phase: 'erase' }),
  hold: (pen) => ({ ...pen, phase: 'erase' }),
  // Letters wiped one by one, a mistake gives way to the right word
  erase: (pen) => {
    if (pen.shown > 1) return { ...pen, shown: pen.shown - 1 }

    return pen.note?.fix
      ? { phase: 'write', note: { ...pen.note, text: pen.note.fix, fix: null }, shown: 0 }
      : PEN_START
  },
}

/**
 * Pen after its current delay
 * @param {PenState} pen - Pen now
 * @param {number} cols - Squares across
 * @param {number} rows - Squares down
 * @return {PenState} - Pen next
 */

export const advancePen = (pen: PenState, cols: number, rows: number): PenState =>
  NEXT[pen.phase](pen, cols, rows)
