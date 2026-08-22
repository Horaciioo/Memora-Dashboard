import { cookieName } from '@/utils/constants/cookies'

/**
 * Session cookie name
 * @type {string}
 */

export const SESSION_COOKIE = cookieName('session')

/**
 * Discord identifier shape
 * @type {RegExp}
 */

export const DISCORD_ID_PATTERN = /^\d{15,25}$/

/**
 * Check identifier shape
 * @param {string} candidate - Raw identifier
 * @return {boolean} - Well formed
 */

export const isDiscordId = (candidate: string): boolean =>
  DISCORD_ID_PATTERN.test(candidate.trim())

/**
 * Strip an identifier
 * @param {FormDataEntryValue | null} raw - Submitted value
 * @return {string} - Clean identifier
 */

export const normaliseDiscordId = (raw: FormDataEntryValue | null): string =>
  String(raw ?? '')
    .trim()
    .replace(/\D/g, '')
