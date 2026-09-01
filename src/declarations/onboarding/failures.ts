/**
 * Query key carrying why a link's identity check failed
 * @type {string}
 */

export const INTEGRATION_ERROR_PARAM = 'erreur'

/**
 * Why an identity check was refused
 * @type {Record<string, string>}
 */

export const INTEGRATION_ERRORS = {
  Refused: 'refused',
  Taken: 'taken',
} as const

export type IntegrationErrorName = (typeof INTEGRATION_ERRORS)[keyof typeof INTEGRATION_ERRORS]
