import type { ChatGate, ChatTurn } from '@/declarations/tour/chat'

/**
 * What the member told Memora
 * @typedef {Object} IntakeAnswers
 * @property {string} [birthday] - ISO day
 * @property {boolean} [celebrateBirthday] - Wants it wished
 * @property {string[]} [languages] - Language codes
 * @property {boolean} [colorBlind] - Said they have a colour vision deficiency, asked only to route the talk
 * @property {boolean} [colorFit] - Found a colour mode that suits them, asked only to route the talk
 * @property {boolean} [instagram] - Gave the one network that is required, asked only to route the talk
 */

export interface IntakeAnswers {
  birthday?: string
  celebrateBirthday?: boolean
  languages?: string[]
  colorBlind?: boolean
  colorFit?: boolean
  instagram?: boolean
}

// What each gate asks of the answers
const GATES: Record<ChatGate, (answers: IntakeAnswers) => boolean> = {
  birthday: (answers) => Boolean(answers.birthday),
  colorBlind: (answers) => answers.colorBlind === true,
  notColorBlind: (answers) => answers.colorBlind === false,
  colorFit: (answers) => answers.colorFit === true,
  colorNoFit: (answers) => answers.colorFit === false,
  noInstagram: (answers) => answers.instagram === false,
}

/**
 * Tell whether the answers let a turn be played
 * @param {ChatGate | undefined} gate - Answer the turn waits for
 * @param {IntakeAnswers} answers - Answers so far
 * @return {boolean} - Turn open
 */

const isOpen = (gate: ChatGate | undefined, answers: IntakeAnswers): boolean =>
  gate === undefined || GATES[gate](answers)

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
    if (isOpen(script[index]?.requires, answers)) return index
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
