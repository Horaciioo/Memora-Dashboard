export const ErrorCodes = {
  InsufficientPermissions: 'InsufficientPermissions',
  NotAuthenticated: 'NotAuthenticated',
  RateLimited: 'RateLimited',
  ValidationFailed: 'ValidationFailed',
  ResourceNotFound: 'ResourceNotFound',
  ResourceConflict: 'ResourceConflict',
  SystemFailure: 'SystemFailure',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Error message map
 * @type {Record<ErrorCode, string>}
 */

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCodes.InsufficientPermissions]: 'You do not have permission to do that.',
  [ErrorCodes.NotAuthenticated]: 'Please sign in to continue.',
  [ErrorCodes.RateLimited]: 'Too many attempts, please wait a moment.',
  [ErrorCodes.ValidationFailed]: 'Some fields need attention.',
  [ErrorCodes.ResourceNotFound]: 'That resource no longer exists.',
  [ErrorCodes.ResourceConflict]: 'That change conflicts with the current state.',
  [ErrorCodes.SystemFailure]: 'Something went wrong on our side.',
}

/**
 * Resolve error message
 * @param {string} code - Error code
 * @param {string} fallback - Fallback message
 * @return {string} - Display message
 */

export const resolveErrorMessage = (code: string, fallback: string): string =>
  code in ERROR_MESSAGES ? ERROR_MESSAGES[code as ErrorCode] : fallback
