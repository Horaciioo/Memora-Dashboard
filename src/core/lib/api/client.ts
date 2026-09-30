import type { ApiEnvelope } from '@/core/lib/http/response'
import { TIMEOUT_SETTINGS } from '@/declarations/configurations/settings'
import { FEEDBACK_COPY } from '@/declarations/ui/copy/feedback'
import { ERROR_MESSAGES, ErrorCodes } from '@/utils/constants/errors'

/**
 * Field level failure sent back by the API
 * @typedef {Object} ApiClientErrorIssue
 * @property {string} [field] - Field name
 * @property {string} message - Display message
 */

export interface ApiClientErrorIssue {
  field?: string
  message: string
}

/**
 * Rejection raised by the API client
 * @typedef {Object} ApiClientError
 * @property {string} code - Error code
 * @property {ApiClientErrorIssue[]} issues - Field failures
 */

export class ApiClientError extends Error {
  readonly code: string
  readonly issues: ApiClientErrorIssue[]

  constructor(message: string, code: string, issues: ApiClientErrorIssue[] = []) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.issues = issues
  }
}

/**
 * Send a request and unwrap its envelope
 * @param {string} path - API path
 * @param {RequestInit} [init] - Fetch options
 * @return {Promise<T>} - Payload
 */

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  // Form data carries its own multipart boundary, so no content type is forced
  const isFormData = init?.body instanceof FormData

  // Reads give up sooner
  const isRead = !init?.method || init.method === 'GET'
  const limit = isRead ? TIMEOUT_SETTINGS.readMs : TIMEOUT_SETTINGS.writeMs

  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(limit),
      headers: isFormData
        ? init?.headers
        : { 'content-type': 'application/json', ...init?.headers },
    })
  } catch (error) {
    // Timeout becomes a readable error
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new ApiClientError(ERROR_MESSAGES[ErrorCodes.TimedOut], ErrorCodes.TimedOut)
    }
    throw error
  }

  const envelope = (await response.json()) as ApiEnvelope<T>

  // The envelope carries the outcome, never the status alone
  if (!envelope.success) {
    throw new ApiClientError(envelope.error, envelope.code, envelope.issues)
  }

  return envelope.data
}

/**
 * Read a resource
 * @param {string} path - API path
 * @param {AbortSignal} [signal] - Cancels the read
 * @return {Promise<T>} - Payload
 */

export const apiGet = <T>(path: string, signal?: AbortSignal): Promise<T> =>
  request<T>(path, signal ? { signal } : undefined)

/**
 * Create a resource
 * @param {string} path - API path
 * @param {unknown} body - Payload to send
 * @return {Promise<T>} - Payload
 */

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })

/**
 * Update part of a resource
 * @param {string} path - API path
 * @param {unknown} body - Payload to send
 * @return {Promise<T>} - Payload
 */

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })

/**
 * Replace a resource
 * @param {string} path - API path
 * @param {unknown} body - Payload to send
 * @return {Promise<T>} - Payload
 */

export const apiPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })

/**
 * Remove a resource, a body carrying the selection when several go at once
 * @param {string} path - API path
 * @param {unknown} [body] - Payload to send
 * @return {Promise<T>} - Payload
 */

export const apiDelete = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, {
    method: 'DELETE',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

/**
 * Upload a file
 * @param {string} path - API path
 * @param {FormData} form - Multipart payload
 * @return {Promise<T>} - Payload
 */

export const apiUpload = <T>(path: string, form: FormData): Promise<T> =>
  request<T>(path, { method: 'POST', body: form })

/**
 * Read the message of an unknown throw
 * @param {unknown} error - Caught value
 * @return {string} - Display message
 */

export const messageOf = (error: unknown): string =>
  error instanceof ApiClientError ? error.message : FEEDBACK_COPY.retry
