import { createRegistry } from '@/core/lib/registry'
import { isDiscordConfigured } from '@/declarations/access/discord'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { ROUTES } from '@/declarations/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { ErrorCodes } from '@/utils/constants/errors'
import type { AppError } from '@/core/lib/errors'

/**
 * Query key carrying why a sign-in attempt failed
 * @type {string}
 */

export const SIGN_IN_ERROR_PARAM = 'erreur'

/**
 * Why a sign-in attempt was refused
 * @type {Record<string, string>}
 */

export const SIGN_IN_ERRORS = {
  Offline: 'offline',
  Refused: 'refused',
  Expired: 'expired',
  Unknown: 'unknown',
  Revoked: 'revoked',
  Throttled: 'throttled',
  Broken: 'broken',
} as const

export type SignInErrorName = (typeof SIGN_IN_ERRORS)[keyof typeof SIGN_IN_ERRORS]

const SIGN_IN_ERROR_MAP = {
  [SIGN_IN_ERRORS.Offline]: { label: AUTH_COPY.discordOffline },
  [SIGN_IN_ERRORS.Refused]: { label: AUTH_COPY.discordRefused },
  [SIGN_IN_ERRORS.Expired]: { label: AUTH_COPY.discordExpired },
  [SIGN_IN_ERRORS.Unknown]: { label: AUTH_COPY.unknownId },
  [SIGN_IN_ERRORS.Revoked]: { label: AUTH_COPY.revokedAccess },
  [SIGN_IN_ERRORS.Throttled]: { label: AUTH_COPY.throttled },
  [SIGN_IN_ERRORS.Broken]: { label: AUTH_COPY.broken },
} satisfies Record<SignInErrorName, { label: string }>

/**
 * Sign-in failures and what each one tells the member
 * @type {Registry<SignInErrorName, { label: string }>}
 */

export const SIGN_IN_ERROR_REGISTRY = createRegistry<SignInErrorName, { label: string }>(
  SIGN_IN_ERROR_MAP
)

/**
 * Build the sign-in destination of a refused attempt
 * @param {AppError} error - Caught failure
 * @return {string} - Sign-in path
 */

export const signInFailure = (error: AppError): string => {
  // A throttled attempt never reaches the flow, so it carries no reason of its own
  const reason: SignInErrorName = SIGN_IN_ERROR_REGISTRY.has(error.message)
    ? error.message
    : error.code === ErrorCodes.RateLimited
      ? SIGN_IN_ERRORS.Throttled
      : SIGN_IN_ERRORS.Broken

  return `${ROUTES.login}?${SIGN_IN_ERROR_PARAM}=${reason}`
}

/**
 * Read the message of a refused attempt
 * @param {string | undefined} reason - Query value
 * @return {string | null} - Display message
 */

export const readSignInError = (reason: string | undefined): string | null => {
  if (!reason || !SIGN_IN_ERROR_REGISTRY.has(reason)) return null

  return SIGN_IN_ERROR_REGISTRY.label(reason)
}

// Branches where signing in with a bare identifier is still tolerated
const FALLBACK_ENVIRONMENTS = ['dev', 'staging']

/**
 * Whether the identifier form may still open a session
 * @return {boolean} - Fallback sign-in allowed
 */

export const isIdentifierSignInAllowed = (): boolean =>
  !isDiscordConfigured() && FALLBACK_ENVIRONMENTS.includes(APP_ENVIRONMENT)
