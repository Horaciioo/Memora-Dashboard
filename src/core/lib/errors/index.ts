import { ErrorCodes, ERROR_MESSAGES, ERROR_STATUSES } from '@/utils/constants/errors'
import type { ErrorCode } from '@/utils/constants/errors'

/**
 * Field level failure
 * @typedef {Object} AppErrorIssue
 * @property {string} [field] - Field name
 * @property {string} message - Display message
 */

export interface AppErrorIssue {
  field?: string
  message: string
}

/**
 * Expected failure carrying an error code
 * @typedef {Object} AppError
 * @property {ErrorCode} code - Error code
 * @property {number} status - HTTP status
 * @property {AppErrorIssue[]} issues - Field failures
 */

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly issues: AppErrorIssue[]

  constructor(code: ErrorCode, message?: string, issues: AppErrorIssue[] = []) {
    super(message ?? ERROR_MESSAGES[code])
    this.name = 'AppError'
    this.code = code
    this.status = ERROR_STATUSES[code]
    this.issues = issues
  }
}

/**
 * Missing session
 * @param {string} [message] - Override message
 * @return {AppError} - Error
 */

export const notAuthenticated = (message?: string): AppError =>
  new AppError(ErrorCodes.NotAuthenticated, message)

/**
 * Missing permission
 * @param {string} [message] - Override message
 * @return {AppError} - Error
 */

export const forbidden = (message?: string): AppError =>
  new AppError(ErrorCodes.InsufficientPermissions, message)

/**
 * Unknown resource
 * @param {string} [message] - Override message
 * @return {AppError} - Error
 */

export const notFound = (message?: string): AppError =>
  new AppError(ErrorCodes.ResourceNotFound, message)

/**
 * Conflicting state
 * @param {string} [message] - Override message
 * @return {AppError} - Error
 */

export const conflict = (message?: string): AppError =>
  new AppError(ErrorCodes.ResourceConflict, message)

/**
 * Protected resource
 * @param {string} [message] - Override message
 * @return {AppError} - Error
 */

export const immutable = (message?: string): AppError =>
  new AppError(ErrorCodes.ImmutableResource, message)

/**
 * Rejected input
 * @param {AppErrorIssue[]} issues - Field failures
 * @param {string} [message] - Override message
 * @return {AppError} - Error
 */

export const invalidInput = (issues: AppErrorIssue[], message?: string): AppError =>
  new AppError(ErrorCodes.ValidationFailed, message, issues)

/**
 * Disabled account
 * @param {string} [message] - Override message
 * @return {AppError} - Error
 */

export const accountDisabled = (message?: string): AppError =>
  new AppError(ErrorCodes.AccountDisabled, message)

/**
 * Normalise an unknown throw
 * @param {unknown} error - Caught value
 * @return {AppError} - Error
 */

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) return error

  // Unique constraint reported by Prisma
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaCode = (error as { code: unknown }).code
    if (prismaCode === 'P2002') return conflict()
    if (prismaCode === 'P2025') return notFound()
  }

  return new AppError(ErrorCodes.SystemFailure)
}
