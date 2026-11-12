import { invalidInput } from '@/core/lib/errors'
import { DISCORD_ID_PATTERN } from '@/core/lib/auth/session'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_ERRORS } from '@/declarations/unban/copy'
import { UNBAN_LABEL_MAX_LENGTH } from '@/utils/constants/unban'
import type { AppErrorIssue } from '@/core/lib/errors'

/**
 * What a moderator asks for when making a link
 * @typedef {Object} NewLinkInput
 * @property {string} youtuberId - Creator the link belongs to
 * @property {number} expiryDays - Validity in days
 * @property {string | null} [expectedDiscordId] - Only account allowed to open it
 * @property {string | null} [label] - Note of the moderator
 */

export interface NewLinkInput {
  youtuberId: string
  expiryDays: number
  expectedDiscordId?: string | null
  label?: string | null
}

/**
 * Link settings once checked and cleaned
 * @typedef {Object} CleanLinkInput
 */

export interface CleanLinkInput {
  youtuberId: string
  expiryDays: number
  expectedDiscordId: string | null
  label: string | null
}

// Issue of a duration the settings do not offer
const EXPIRY_ISSUE: AppErrorIssue = { field: 'expiryDays', message: UNBAN_ERRORS.badExpiry }

/**
 * Whether the settings offer a validity
 * @param {number} days - Asked duration
 * @return {boolean} - Offered
 */

const isExpiryChoice = (days: number): boolean => UNBAN_SETTINGS.expiryChoicesDays.includes(days)

/**
 * Refuse a validity the settings do not offer
 * @param {number} days - Asked duration
 * @return {void}
 */

export const assertExpiryChoice = (days: number): void => {
  if (!isExpiryChoice(days)) throw invalidInput([EXPIRY_ISSUE])
}

// Trimmed text, null when blank
const blankToNull = (value: string | null | undefined): string | null => value?.trim() || null

/**
 * Check and clean the settings of a new link
 * @param {NewLinkInput} input - Raw settings
 * @return {CleanLinkInput} - Clean settings
 */

export const cleanLinkInput = (input: NewLinkInput): CleanLinkInput => {
  const expectedDiscordId = blankToNull(input.expectedDiscordId)
  const label = blankToNull(input.label)
  const issues: AppErrorIssue[] = []

  if (!isExpiryChoice(input.expiryDays)) issues.push(EXPIRY_ISSUE)
  if (expectedDiscordId && !DISCORD_ID_PATTERN.test(expectedDiscordId)) {
    issues.push({ field: 'expectedDiscordId', message: UNBAN_ERRORS.badDiscordId })
  }
  if (label && label.length > UNBAN_LABEL_MAX_LENGTH) {
    issues.push({ field: 'label', message: UNBAN_ERRORS.labelTooLong })
  }
  if (issues.length > 0) throw invalidInput(issues)

  return { youtuberId: input.youtuberId, expiryDays: input.expiryDays, expectedDiscordId, label }
}
