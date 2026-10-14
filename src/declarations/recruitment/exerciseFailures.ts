/**
 * Query key carrying why an identity check failed
 * @type {string}
 */

export const EXERCISE_ERROR_PARAM = 'erreur'

/**
 * Why an identity check was refused
 * @type {Record<string, string>}
 */

export const EXERCISE_ERRORS = {
  Refused: 'refused',
  WrongAccount: 'other-account',
} as const

export type ExerciseErrorName = (typeof EXERCISE_ERRORS)[keyof typeof EXERCISE_ERRORS]
