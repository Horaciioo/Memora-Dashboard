/**
 * Query key carrying why an identity check failed
 * @type {string}
 */

export const UNBAN_FAILURE_PARAM = 'error'

/**
 * Why an identity check was refused
 * @type {Record<string, string>}
 */

export const UNBAN_FAILURES = {
  Refused: 'refused',
  WrongAccount: 'other-account',
} as const

export type UnbanFailureName = (typeof UNBAN_FAILURES)[keyof typeof UNBAN_FAILURES]
