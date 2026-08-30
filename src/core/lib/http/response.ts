import { AppError, toAppError } from '@/core/lib/errors'
import type { AppErrorIssue } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import { ErrorCodes } from '@/utils/constants/errors'

/**
 * Successful envelope
 * @typedef {Object} ApiSuccess
 * @property {true} success - Always true
 * @property {T} data - Payload
 */

export interface ApiSuccess<T> {
  success: true
  data: T
}

/**
 * Failed envelope
 * @typedef {Object} ApiFailure
 * @property {false} success - Always false
 * @property {string} code - Error code
 * @property {string} error - Display message
 * @property {AppErrorIssue[]} issues - Field failures
 */

export interface ApiFailure {
  success: false
  code: string
  error: string
  issues: AppErrorIssue[]
}

/**
 * Either envelope
 * @type {ApiSuccess<T> | ApiFailure}
 */

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

/**
 * Wrap a payload
 * @param {T} data - Payload
 * @param {number} [status] - HTTP status
 * @return {Response} - JSON response
 */

export const succeed = <T>(data: T, status = 200): Response =>
  Response.json({ success: true, data } satisfies ApiSuccess<T>, { status })

/**
 * Wrap a failure
 * @param {unknown} error - Caught value
 * @return {Response} - JSON response
 */

export const fail = (error: unknown): Response => {
  const appError: AppError = toAppError(error)

  // Only an unexpected throw is worth a log line, an expected one is a return value
  if (appError.code === ErrorCodes.SystemFailure) logger.error('[api]', error)

  // An exhausted limit tells the caller when to come back
  const headers =
    appError.retryAfterSeconds === undefined
      ? undefined
      : { 'retry-after': String(appError.retryAfterSeconds) }

  return Response.json(
    {
      success: false,
      code: appError.code,
      error: appError.message,
      issues: appError.issues,
    } satisfies ApiFailure,
    { status: appError.status, ...(headers ? { headers } : {}) }
  )
}
