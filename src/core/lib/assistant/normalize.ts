import { foldText } from '@/utils/format/strings'

/**
 * One word of a sentence
 * @typedef {Object} AssistantToken
 * @property {string} folded - Comparable form
 * @property {number} start - First offset
 * @property {number} end - Offset after
 * @property {boolean} mention - Typed with @
 */

export interface AssistantToken {
  folded: string
  start: number
  end: number
  mention: boolean
}

// Words glued by an apostrophe or a dash
const GLUED = [
  [/aujourd['’]hui/gi, 'aujourdhui'],
  [/apr[eè]s[- ]demain/gi, 'apresdemain'],
] as const

// Letters, digits and slashes
const WORD = /@?[\p{L}\p{N}]+(?:\/[\p{N}]+)*/gu

/**
 * Merge glued words
 * @param {string} text - Raw sentence
 * @return {string} - Same length text
 */

const unglue = (text: string): string =>
  GLUED.reduce(
    // Padding keeps every offset in place
    (current, [pattern, word]) =>
      current.replace(pattern, (match) => word.padEnd(match.length, ' ')),
    text
  )

/**
 * Split a sentence
 * @param {string} text - Raw sentence
 * @return {AssistantToken[]} - Words in order
 */

export const tokenize = (text: string): AssistantToken[] =>
  [...unglue(text).matchAll(WORD)].map((match) => {
    const mention = match[0].startsWith('@')

    return {
      folded: foldText(mention ? match[0].slice(1) : match[0]),
      start: match.index + (mention ? 1 : 0),
      end: match.index + match[0].length,
      mention,
    }
  })

/**
 * Damerau edit distance
 * @param {string} left - First word
 * @param {string} right - Second word
 * @return {number} - Edits needed
 */

export const editDistance = (left: string, right: string): number => {
  // One row per prefix of the left word
  const rows: number[][] = Array.from({ length: left.length + 1 }, (_, index) =>
    Array.from({ length: right.length + 1 }, (_, column) => (index === 0 ? column : 0))
  )

  for (let index = 1; index <= left.length; index += 1) {
    rows[index][0] = index

    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[index - 1] === right[column - 1] ? 0 : 1
      rows[index][column] = Math.min(
        rows[index - 1][column] + 1,
        rows[index][column - 1] + 1,
        rows[index - 1][column - 1] + cost
      )

      // Swapped neighbours count once
      const swapped =
        index > 1 &&
        column > 1 &&
        left[index - 1] === right[column - 2] &&
        left[index - 2] === right[column - 1]
      if (swapped)
        rows[index][column] = Math.min(rows[index][column], rows[index - 2][column - 2] + 1)
    }
  }

  return rows[left.length][right.length]
}

/**
 * Typos allowed for a word
 * @param {string} word - Expected word
 * @return {number} - Allowed edits
 */

export const typoBudget = (word: string): number => {
  if (word.length >= 8) return 2
  if (word.length >= 5) return 1

  return 0
}

/**
 * Typed word reads as expected
 * @param {string} typed - Folded typed word
 * @param {string} expected - Folded expected word
 * @return {boolean} - Close enough
 */

export const isSimilar = (typed: string, expected: string): boolean =>
  typed === expected ||
  (Math.abs(typed.length - expected.length) <= typoBudget(expected) &&
    editDistance(typed, expected) <= typoBudget(expected))
