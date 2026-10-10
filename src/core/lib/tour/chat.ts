import type { ChatTurn } from '@/declarations/tour/chat'

/**
 * What the member told Memora
 * @typedef {Object} IntakeAnswers
 * @property {string} [birthday] - ISO day
 * @property {boolean} [celebrateBirthday] - Wants it wished
 * @property {string[]} [languages] - Language codes
 */

export interface IntakeAnswers {
  birthday?: string
  celebrateBirthday?: boolean
  languages?: string[]
}

/**
 * Turn that follows, skipping those whose answer is missing
 * @param {ChatTurn[]} script - Memora's turns
 * @param {number} from - Turn just played
 * @param {IntakeAnswers} answers - Answers so far
 * @return {number | null} - Next turn or null at the end
 */

export const nextTurn = (
  script: ChatTurn[],
  from: number,
  answers: IntakeAnswers
): number | null => {
  for (let index = from + 1; index < script.length; index += 1) {
    const requires = script[index]?.requires
    if (!requires || answers[requires]) return index
  }

  return null
}

/**
 * How long Memora types a message
 * @param {number} length - Characters
 * @param {Object} pace - Typing settings
 * @param {number} pace.typingMsPerChar - Time per character
 * @param {number} pace.typingMinMs - Shortest
 * @param {number} pace.typingMaxMs - Longest
 * @return {number} - Milliseconds
 */

export const typingDuration = (
  length: number,
  pace: { typingMsPerChar: number; typingMinMs: number; typingMaxMs: number }
): number => Math.min(Math.max(length * pace.typingMsPerChar, pace.typingMinMs), pace.typingMaxMs)
