import { DISCORD_ID_PATTERN } from '@/core/lib/auth/session'
import { forbidden, invalidInput } from '@/core/lib/errors'
import { identityFor, isExpectedAccount } from '@/core/lib/unban/ticket'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_FORM_FIELDS } from '@/utils/constants/unban'
import type { UnbanIdentity, UnbanTicket } from '@/core/lib/unban/ticket'
import type { PublicLinkRow } from '@/core/services/unban/links/public'

// Longest pseudonym a person types
const NAME_MAX_LENGTH = 100

/**
 * Account a person typed because the sign-in is off
 * @param {Record<string, unknown>} typed - Reserved fields of the body
 * @return {UnbanIdentity} - Typed identity
 */

const readTyped = (typed: Record<string, unknown>): UnbanIdentity => {
  const discordId = String(typed[UNBAN_FORM_FIELDS.discordId] ?? '').trim()
  const name = String(typed[UNBAN_FORM_FIELDS.discordName] ?? '').trim()

  const issues = [
    ...(DISCORD_ID_PATTERN.test(discordId)
      ? []
      : [{ field: UNBAN_FORM_FIELDS.discordId, message: UNBAN_PUBLIC_COPY.badDiscordId }]),
    ...(name.length > 0 && name.length <= NAME_MAX_LENGTH
      ? []
      : [{ field: UNBAN_FORM_FIELDS.discordName, message: UNBAN_PUBLIC_COPY.badDiscordName }]),
  ]
  if (issues.length > 0) throw invalidInput(issues)

  return { discordId, name, avatar: null }
}

/**
 * Account that files the request, proven by Discord or typed when the proof is off
 * @param {PublicLinkRow} link - Link being submitted
 * @param {UnbanTicket | null} ticket - Ticket of the browser
 * @param {string} token - Secret from the address
 * @param {Record<string, unknown>} typed - Reserved fields of the body
 * @return {UnbanIdentity} - Account filing
 */

export const filingIdentity = (
  link: PublicLinkRow,
  ticket: UnbanTicket | null,
  token: string,
  typed: Record<string, unknown>
): UnbanIdentity => {
  const identity = UNBAN_SETTINGS.requireDiscordIdentity
    ? identityFor(ticket, token)
    : readTyped(typed)

  if (!identity || !isExpectedAccount(link.expectedDiscordId, identity.discordId)) throw forbidden()

  return identity
}
