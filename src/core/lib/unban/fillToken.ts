import { seal, unseal } from '@/core/lib/unban/seal'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { MINUTE_MS, SECOND_MS } from '@/utils/constants/time'

/**
 * Why a fill token was refused
 * @type {Record<string, string>}
 */

export const FILL_REFUSALS = {
  Invalid: 'invalid',
  TooFast: 'too-fast',
  Stale: 'stale',
} as const

export type FillRefusalName = (typeof FILL_REFUSALS)[keyof typeof FILL_REFUSALS]

/**
 * Result of checking a fill token
 * @typedef {Object} FillCheck
 * @property {string | null} formVersionId - Form version the person was served
 * @property {FillRefusalName | null} refusal - Why it was refused
 */

export interface FillCheck {
  formVersionId: string | null
  refusal: FillRefusalName | null
}

/**
 * Token signed when the form is shown
 * @param {string} youtuberId - Creator opened
 * @param {string} formVersionId - Version served
 * @param {number} [now] - Moment of issue
 * @return {string} - Token for a hidden field
 */

export const issueFillToken = (
  youtuberId: string,
  formVersionId: string,
  now: number = Date.now()
): string => seal({ youtuberId, formVersionId, issuedAt: now })

// Refusal with no version
const refuse = (refusal: FillRefusalName): FillCheck => ({ formVersionId: null, refusal })

/**
 * Check a fill token against the creator being filed
 * @param {string | undefined} token - Value of the hidden field
 * @param {string} youtuberId - Creator being filed
 * @param {number} [now] - Moment of the submission
 * @return {FillCheck} - Version served, or the refusal
 */

export const checkFillToken = (
  token: string | undefined,
  youtuberId: string,
  now: number = Date.now()
): FillCheck => {
  const content = unseal(token)
  const { youtuberId: issuedFor, formVersionId, issuedAt } = content ?? {}

  if (
    issuedFor !== youtuberId ||
    typeof formVersionId !== 'string' ||
    typeof issuedAt !== 'number'
  ) {
    return refuse(FILL_REFUSALS.Invalid)
  }

  // A robot answers before a person could read
  if (now - issuedAt < UNBAN_SETTINGS.minFillSeconds * SECOND_MS)
    return refuse(FILL_REFUSALS.TooFast)
  if (now - issuedAt > UNBAN_SETTINGS.ticketMinutes * MINUTE_MS) return refuse(FILL_REFUSALS.Stale)

  return { formVersionId, refusal: null }
}
