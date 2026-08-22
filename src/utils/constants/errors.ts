export const ErrorCodes = {
  InsufficientPermissions: 'InsufficientPermissions',
  NotAuthenticated: 'NotAuthenticated',
  AccountDisabled: 'AccountDisabled',
  RateLimited: 'RateLimited',
  ValidationFailed: 'ValidationFailed',
  ResourceNotFound: 'ResourceNotFound',
  ResourceConflict: 'ResourceConflict',
  ImmutableResource: 'ImmutableResource',
  SystemFailure: 'SystemFailure',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Error message map
 * @type {Record<ErrorCode, string>}
 */

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCodes.InsufficientPermissions]: 'Tu n’as pas les droits pour faire ça.',
  [ErrorCodes.NotAuthenticated]: 'Connecte-toi pour continuer.',
  [ErrorCodes.AccountDisabled]: 'Ton accès a été désactivé.',
  [ErrorCodes.RateLimited]: 'Trop d’essais, patiente un instant.',
  [ErrorCodes.ValidationFailed]: 'Certains champs demandent une correction.',
  [ErrorCodes.ResourceNotFound]: 'Cet élément n’existe plus.',
  [ErrorCodes.ResourceConflict]: 'Ce nom est déjà pris.',
  [ErrorCodes.ImmutableResource]: 'Cet élément ne peut pas être modifié.',
  [ErrorCodes.SystemFailure]: 'Quelque chose a cassé de notre côté.',
}

/**
 * HTTP status per error code
 * @type {Record<ErrorCode, number>}
 */

export const ERROR_STATUSES: Record<ErrorCode, number> = {
  [ErrorCodes.InsufficientPermissions]: 403,
  [ErrorCodes.NotAuthenticated]: 401,
  [ErrorCodes.AccountDisabled]: 403,
  [ErrorCodes.RateLimited]: 429,
  [ErrorCodes.ValidationFailed]: 422,
  [ErrorCodes.ResourceNotFound]: 404,
  [ErrorCodes.ResourceConflict]: 409,
  [ErrorCodes.ImmutableResource]: 409,
  [ErrorCodes.SystemFailure]: 500,
}

/**
 * Resolve error message
 * @param {string} code - Error code
 * @param {string} fallback - Fallback message
 * @return {string} - Display message
 */

export const resolveErrorMessage = (code: string, fallback: string): string =>
  code in ERROR_MESSAGES ? ERROR_MESSAGES[code as ErrorCode] : fallback
