import * as Sentry from '@sentry/nextjs'

/**
 * Sentry availability
 * @type {boolean}
 */

export const isSentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)

/**
 * Capture an exception
 * @param {Error} error - Thrown error
 * @param {Record<string, unknown>} [context] - Extra context
 * @return {void}
 */

export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  if (!isSentryEnabled) return

  Sentry.captureException(error, context ? { extra: context } : undefined)
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
 * Attach the current user
 * @param {?{ id: string, identifier: string }} user - Session user
 * @return {void}
 */

export const setSentryUser = (user: { id: string; identifier: string } | null): void => {
  if (!isSentryEnabled) return

  Sentry.setUser(user ? { id: user.id, username: user.identifier } : null)
}
