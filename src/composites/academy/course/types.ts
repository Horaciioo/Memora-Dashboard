import type { ExerciseAnswer, ExerciseResult } from '@/core/lib/curriculum/scoring'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'

/**
 * What every exercise view receives from the player
 * @typedef {Object} ExerciseViewProps
 * @property {ExerciseBlock} block - Exercise declared in code
 * @property {ExerciseAnswer | undefined} answer - What sits in it
 * @property {ExerciseResult | undefined} result - Last check
 * @property {boolean} isSaving - Check being saved
 * @property {(answer: ExerciseAnswer) => void} onAnswer - Change the answer
 * @property {(answer?: ExerciseAnswer) => void} onCheck - Score and save
 * @property {() => void} onRetry - Reopen after a miss
 */

export interface ExerciseViewProps<TBlock extends ExerciseBlock = ExerciseBlock> {
  block: TBlock
  answer: ExerciseAnswer | undefined
  result: ExerciseResult | undefined
  isSaving: boolean
  onAnswer: (answer: ExerciseAnswer) => void
  onCheck: (answer?: ExerciseAnswer) => void
  onRetry: () => void
}

/**
 * Read an answer keyed by part
 * @param {ExerciseAnswer | undefined} answer - Raw answer
 * @return {Record<string, string | string[]>} - Record
 */

export const asRecord = (answer: ExerciseAnswer | undefined): Record<string, string | string[]> =>
  answer && typeof answer === 'object' && !Array.isArray(answer)
    ? (answer as Record<string, string | string[]>)
    : {}

/**
 * Read an answer made of a list
 * @param {ExerciseAnswer | undefined} answer - Raw answer
 * @return {string[]} - List
 */

export const asList = (answer: ExerciseAnswer | undefined): string[] =>
  Array.isArray(answer) ? answer.map(String) : []
