import { CLOSING_QUESTIONS } from '@/declarations/recruitment/questionnaire/bank/closing'
import {
  CREATOR_QUESTIONS,
  MODERATION_QUESTIONS,
  SOCIAL_QUESTIONS,
} from '@/declarations/recruitment/questionnaire/bank/discovery'
import { PROFILE_QUESTIONS } from '@/declarations/recruitment/questionnaire/bank/profile'
import { SITUATION_QUESTIONS } from '@/declarations/recruitment/questionnaire/bank/situations'
import type { QuestionDefinition } from '@/declarations/recruitment/questionnaire/types'

/**
 * Every question of the interview bank, in asking order
 * @type {readonly QuestionDefinition[]}
 */

export const QUESTION_BANK: readonly QuestionDefinition[] = [
  ...PROFILE_QUESTIONS,
  ...SOCIAL_QUESTIONS,
  ...CREATOR_QUESTIONS,
  ...MODERATION_QUESTIONS,
  ...SITUATION_QUESTIONS,
  ...CLOSING_QUESTIONS,
]

export {
  QUESTION_PART_ORDER,
  QUESTION_PARTS,
  PLATFORM_TERMS,
} from '@/declarations/recruitment/questionnaire/parts'
export type * from '@/declarations/recruitment/questionnaire/types'
