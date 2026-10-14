import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { EXERCISE_ORDER } from '@/declarations/recruitment/exercises'
import type { ExerciseKey } from '@/declarations/recruitment/questionnaire'

// Seconds in a minute
const MINUTE = 60

/**
 * Seconds a written pause allows
 * @param {string | undefined} pause - Pause as declared
 * @return {number | null} - Longest bound
 */

export const pauseSeconds = (pause: string | undefined): number | null => {
  const numbers = pause?.match(/\d+/g)
  if (!numbers) return null

  return Number(numbers.at(-1)) * (/min/i.test(pause ?? '') ? MINUTE : 1)
}

/**
 * Answer key of one step
 * @param {string} questionKey - Question of the bank
 * @param {number} index - Step position
 * @return {string} - Key
 */

export const stepKey = (questionKey: string, index: number): string => `${questionKey}:${index}`

/**
 * Exercises the pick holds, in showing order
 * @param {ResolvedQuestion[]} questions - Questions of the part
 * @return {ExerciseKey[]} - Exercises on offer
 */

export const offeredExercises = (questions: ResolvedQuestion[]): ExerciseKey[] =>
  EXERCISE_ORDER.filter((key) => questions.some((question) => question.exercise === key))

/**
 * Questions played in one exercise
 * @param {ResolvedQuestion[]} questions - Questions of the part
 * @param {ExerciseKey} exercise - Exercise chosen
 * @return {ResolvedQuestion[]} - Questions in order
 */

export const exerciseQuestions = (
  questions: ResolvedQuestion[],
  exercise: ExerciseKey
): ResolvedQuestion[] => questions.filter((question) => question.exercise === exercise)

/**
 * One entry picked at random
 * @param {T[]} options - Entries to draw from
 * @param {() => number} [random] - Source in [0, 1)
 * @return {T | undefined} - Entry drawn
 */

export const pickAtRandom = <T>(options: T[], random: () => number = Math.random): T | undefined =>
  options[Math.floor(random() * options.length)]
