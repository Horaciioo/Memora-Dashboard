import { parseFormValues } from '@/core/lib/forms/parse'
import { UNBAN_FORM_COPY } from '@/declarations/unban/copy'
import { toFieldDefinitions } from '@/declarations/unban/form'
import { formatDay } from '@/utils/format/time/dates'
import { UnbanQuestionTypes } from '@/utils/constants/unban'
import type { FieldIssue, FieldValue } from '@/types/forms'
import type { UnbanAnswer, UnbanFormSnapshot, UnbanQuestion } from '@/declarations/unban/form'

/**
 * Labels of the options a value picked
 * @param {UnbanQuestion} question - Question answered
 * @param {FieldValue} value - Answer
 * @return {string[] | undefined} - Picked labels
 */

const labelsOf = (question: UnbanQuestion, value: FieldValue): string[] | undefined => {
  if (!question.options) return undefined
  const picked = Array.isArray(value) ? value : value === null ? [] : [String(value)]

  return question.options
    .filter((option) => picked.includes(option.id))
    .map((option) => option.label)
}

/**
 * Answer as it is kept
 * @param {UnbanQuestion} question - Question answered
 * @param {FieldValue} value - Answer
 * @return {UnbanAnswer} - Stored answer
 */

const toAnswer = (question: UnbanQuestion, value: FieldValue): UnbanAnswer => ({
  questionId: question.id,
  label: question.label,
  type: question.type,
  value,
  ...(question.options ? { optionLabels: labelsOf(question, value) } : {}),
})

/**
 * Answers, or why they were refused
 * @typedef {Object} SubmissionCheck
 * @property {UnbanAnswer[]} answers - Kept answers
 * @property {FieldIssue[]} issues - Rejections
 */

export interface SubmissionCheck {
  answers: UnbanAnswer[]
  issues: FieldIssue[]
}

/**
 * Validate a submission against the form it was served
 * @param {UnbanFormSnapshot} snapshot - Form served
 * @param {Record<string, unknown>} body - Raw answers by question
 * @return {SubmissionCheck} - Answers and rejections
 */

export const checkSubmission = (
  snapshot: UnbanFormSnapshot,
  body: Record<string, unknown>
): SubmissionCheck => {
  const known = new Set(snapshot.questions.map((question) => question.id))
  const strangers = Object.keys(body)
    .filter((key) => !known.has(key))
    .map((field) => ({ field, message: UNBAN_FORM_COPY.unknownAnswer }))

  const { values, issues } = parseFormValues(toFieldDefinitions(snapshot), body, {
    fillMissing: true,
  })

  return {
    answers: snapshot.questions.map((question) => toAnswer(question, values[question.id] ?? null)),
    issues: [...strangers, ...issues],
  }
}

/**
 * Answer as a line of text
 * @param {UnbanAnswer} answer - Stored answer
 * @return {string | null} - Text, null when blank
 */

export const answerText = (answer: UnbanAnswer): string | null => {
  if (answer.optionLabels) return answer.optionLabels.length ? answer.optionLabels.join(', ') : null
  if (answer.value === null || answer.value === '') return null
  if (answer.type === UnbanQuestionTypes.Date) return formatDay(String(answer.value))

  return String(answer.value)
}
