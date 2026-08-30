import * as Sentry from '@sentry/nextjs'

import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { SENTRY_SETTINGS, SCRUBBED_KEYS } from '@/declarations/system/reporting'

/**
 * Sentry availability
 * @type {boolean}
 */

export const isSentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)

let started = false

/**
 * Whether one key names something that must never leave the server
 * @param {string} key - Property name
 * @return {boolean} - Key carries personal data
 */

const isSensitive = (key: string): boolean => {
  const lowered = key.toLowerCase()

  return SCRUBBED_KEYS.some((needle) => lowered.includes(needle))
}

/**
 * Replace every sensitive value of one payload, however deep it sits
 * @param {unknown} value - Payload
 * @param {number} [depth] - Remaining depth
 * @return {unknown} - Scrubbed payload
 */

const scrub = (value: unknown, depth = SENTRY_SETTINGS.scrubDepth): unknown => {
  if (depth <= 0 || value === null || typeof value !== 'object') return value

  if (Array.isArray(value)) return value.map((entry) => scrub(entry, depth - 1))

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      isSensitive(key) ? SENTRY_SETTINGS.redaction : scrub(entry, depth - 1),
    ])
  )
}

/**
 * Start error reporting, doing nothing without a DSN
 * @return {void}
 */

export const initialiseSentry = (): void => {
  if (!isSentryEnabled || started) return

  started = true

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: APP_ENVIRONMENT,
    tracesSampleRate: SENTRY_SETTINGS.tracesSampleRate,
    sendDefaultPii: false,
    beforeSend: (event) => {
      // Request bodies, headers and cookies never reach a third party
      if (event.request) {
        delete event.request.cookies
        delete event.request.headers
        event.request.data = undefined
      }

      if (event.extra) event.extra = scrub(event.extra) as Record<string, unknown>
      if (event.user) event.user = { id: event.user.id }

      return event
    },
  })
}

/**
 * Capture an exception
 * @param {Error} error - Thrown error
 * @param {Record<string, unknown>} [context] - Extra context
 * @return {void}
 */

export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  if (!isSentryEnabled) return

  Sentry.captureException(
    error,
    context ? { extra: scrub(context) as Record<string, unknown> } : undefined
  )
}

/**
 * Capture a message
 * @param {string} message - Message body
 * @param {Sentry.SeverityLevel} [level] - Severity
 * @return {void}
 */

export const captureMessage = (message: string, level?: Sentry.SeverityLevel): void => {
  if (!isSentryEnabled) return

  Sentry.captureMessage(message, level)
}

/**
 * Report a failing request, the identity staying a bare identifier
 * @param {unknown} error - Caught exception
 * @param {unknown} request - Failing request
 * @param {unknown} context - Where it failed
 * @return {void}
 */

export const captureRequestError = (error: unknown, request: unknown, context: unknown): void => {
  if (!isSentryEnabled) return

  Sentry.captureRequestError(
    error,
    request as Parameters<typeof Sentry.captureRequestError>[1],
    context as Parameters<typeof Sentry.captureRequestError>[2]
  )
}

/**
 * Attach the current user, by identifier only
 * @param {?{ id: string }} user - Session user
 * @return {void}
 */

export const setSentryUser = (user: { id: string } | null): void => {
  if (!isSentryEnabled) return

  Sentry.setUser(user ? { id: user.id } : null)
}
