import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_QUESTION_TYPE_REGISTRY } from '@/declarations/unban/registries'
import type { FieldDefinition, FieldValue } from '@/types/forms'
import { UNBAN_FORM_FIELDS } from '@/utils/constants/unban'
import type { UnbanQuestionTypeName } from '@/utils/constants/unban'

/**
 * Choice of a question
 * @typedef {Object} UnbanOption
 * @property {string} id - Stable identifier
 * @property {string} label - Display label
 */

export interface UnbanOption {
  id: string
  label: string
}

/**
 * Bounds and captions of a scale
 * @typedef {Object} UnbanScale
 * @property {number} min - Lowest step
 * @property {number} max - Highest step
 * @property {string} [lowLabel] - Caption of the low end
 * @property {string} [highLabel] - Caption of the high end
 */

export interface UnbanScale {
  min: number
  max: number
  lowLabel?: string
  highLabel?: string
}

/**
 * Question of the form
 * @typedef {Object} UnbanQuestion
 * @property {string} id - Stable identifier
 * @property {UnbanQuestionTypeName} type - Kind of question
 * @property {string} label - Question text
 * @property {string} [hint] - Helper line
 * @property {boolean} required - Must be answered
 * @property {UnbanOption[]} [options] - Choices
 * @property {number} [maxLength] - Longest text answer
 * @property {UnbanScale} [scale] - Scale bounds
 */

export interface UnbanQuestion {
  id: string
  type: UnbanQuestionTypeName
  label: string
  hint?: string
  required: boolean
  options?: UnbanOption[]
  maxLength?: number
  scale?: UnbanScale
}

/**
 * Whole form as frozen in a version
 * @typedef {Object} UnbanFormSnapshot
 * @property {UnbanQuestion[]} questions - Ordered questions
 * @property {string} [intro] - Text above the questions
 * @property {string} [outro] - Text below the questions
 */

export interface UnbanFormSnapshot {
  questions: UnbanQuestion[]
  intro?: string
  outro?: string
}

/**
 * Answer kept with the question it answered
 * @typedef {Object} UnbanAnswer
 * @property {string} questionId - Question identifier
 * @property {string} label - Question text at the time
 * @property {UnbanQuestionTypeName} type - Kind of question
 * @property {FieldValue} value - Answer, option identifiers for a choice
 * @property {string[]} [optionLabels] - Labels of the picked options
 */

export interface UnbanAnswer {
  questionId: string
  label: string
  type: UnbanQuestionTypeName
  value: FieldValue
  optionLabels?: string[]
}

/**
 * Longest text a question of this kind takes
 * @param {UnbanQuestion} question - Question
 * @return {number} - Character limit
 */

const textLimit = (question: UnbanQuestion): number =>
  question.maxLength ??
  (UNBAN_QUESTION_TYPE_REGISTRY.get(question.type).fieldKind === 'textarea'
    ? UNBAN_SETTINGS.answerMaxLength
    : UNBAN_SETTINGS.shortAnswerMaxLength)

/**
 * Field a question becomes
 * @param {UnbanQuestion} question - Question
 * @return {FieldDefinition} - Field declaration
 */

export const toFieldDefinition = (question: UnbanQuestion): FieldDefinition => {
  const type = UNBAN_QUESTION_TYPE_REGISTRY.get(question.type)
  const options = (question.options ?? []).map(({ id, label }) => ({ value: id, label }))

  return {
    name: question.id,
    kind: type.fieldKind,
    label: question.label,
    hint: question.hint,
    required: question.required,
    span: 'full',
    ...(type.fieldKind === 'text' || type.fieldKind === 'textarea'
      ? { maxLength: textLimit(question) }
      : {}),
    ...(type.hasOptions
      ? { options, presentation: type.isList ? ('list' as const) : ('menu' as const) }
      : {}),
    ...(type.fieldKind === 'multiselect' ? { maxItems: options.length } : {}),
    ...(question.scale
      ? {
          min: question.scale.min,
          max: question.scale.max,
          scaleLabels: [question.scale.lowLabel ?? '', question.scale.highLabel ?? ''] as [
            string,
            string,
          ],
        }
      : {}),
  }
}

/**
 * Fields of a whole form
 * @param {UnbanFormSnapshot} snapshot - Frozen form
 * @return {FieldDefinition[]} - Field declarations
 */

export const toFieldDefinitions = (snapshot: UnbanFormSnapshot): FieldDefinition[] =>
  snapshot.questions.map(toFieldDefinition)

/**
 * Fields a person types when the Discord proof is off
 * @type {FieldDefinition[]}
 */

export const TYPED_IDENTITY_FIELDS: FieldDefinition[] = [
  {
    name: UNBAN_FORM_FIELDS.discordId,
    kind: 'text',
    label: UNBAN_PUBLIC_COPY.typedId,
    required: true,
    span: 'full',
    maxLength: 25,
  },
  {
    name: UNBAN_FORM_FIELDS.discordName,
    kind: 'text',
    label: UNBAN_PUBLIC_COPY.typedName,
    required: true,
    span: 'full',
    maxLength: 100,
  },
]
