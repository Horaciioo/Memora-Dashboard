// Attribute naming a question card
const QUESTION_ATTRIBUTE = 'data-question-key'

// Joins the parts of a place
const SEPARATOR = '|'

/**
 * Where a member stands in an interview
 * @typedef {Object} InterviewPlace
 * @property {string} candidateId - Candidate interviewed
 * @property {number} step - Zero for the introduction
 * @property {string | null} questionKey - Question last touched
 */

export interface InterviewPlace {
  candidateId: string
  step: number
  questionKey: string | null
}

/**
 * Place as the presence room carries it
 * @param {InterviewPlace} place - Position
 * @return {string} - Encoded place
 */

export const placeOf = ({ candidateId, step, questionKey }: InterviewPlace): string =>
  [candidateId, step, questionKey ?? ''].join(SEPARATOR)

/**
 * Read an encoded place
 * @param {string | null} place - Encoded place
 * @return {InterviewPlace | null} - Position, null when foreign
 */

export const readPlace = (place: string | null): InterviewPlace | null => {
  const [candidateId, step, questionKey] = (place ?? '').split(SEPARATOR)
  const index = Number(step)
  if (!candidateId || !Number.isInteger(index)) return null

  return { candidateId, step: index, questionKey: questionKey || null }
}

/**
 * Attribute marking a question card
 * @param {string} key - Question key
 * @return {Record<string, string>} - Spread on the card
 */

export const questionMark = (key: string): Record<string, string> => ({ [QUESTION_ATTRIBUTE]: key })

/**
 * Question card holding a target
 * @param {EventTarget | null} target - Event target
 * @return {string | null} - Question key
 */

export const questionKeyOf = (target: EventTarget | null): string | null =>
  target instanceof Element
    ? (target.closest(`[${QUESTION_ATTRIBUTE}]`)?.getAttribute(QUESTION_ATTRIBUTE) ?? null)
    : null

/**
 * Card of a question on screen
 * @param {string} key - Question key
 * @return {HTMLElement | null} - Card
 */

export const questionElementOf = (key: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[${QUESTION_ATTRIBUTE}="${CSS.escape(key)}"]`)
