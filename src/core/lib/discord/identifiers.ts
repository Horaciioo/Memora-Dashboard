import { DISCORD_ID_KIND_REGISTRY, identifierToken } from '@/declarations/discord/registries'
import type { DiscordIdentifierView } from '@/types/discord'
import { DiscordIdKinds } from '@/utils/constants/discord'
import type { MentionEntry } from '@/utils/format/discord'

// Any token Discord turns into a name
const TOKEN_PATTERN = /<@&\d+>|<@!?\d+>|<#\d+>/g

/**
 * Name as the writer types it
 * @param {DiscordIdentifierView} identifier - Stored identifier
 * @return {string} - Prefixed name
 */

const displayOf = (identifier: DiscordIdentifierView): string =>
  `${DISCORD_ID_KIND_REGISTRY.get(identifier.kind).mention === 'channel' ? '#' : '@'}${identifier.name}`

/**
 * Mentions the stored identifiers answer to
 * @param {DiscordIdentifierView[]} identifiers - Stored identifiers
 * @return {MentionEntry[]} - Token and name pairs
 */

export const identifierEntries = (identifiers: DiscordIdentifierView[]): MentionEntry[] =>
  identifiers.flatMap((identifier) => {
    const token = identifierToken(identifier.kind, identifier.discordId)

    return token ? [{ token, display: displayOf(identifier) }] : []
  })

/**
 * Token of the waiting role of one creator
 * @param {DiscordIdentifierView[]} identifiers - Stored identifiers
 * @param {string} youtuberId - Creator identifier
 * @return {string | null} - Role token
 */

export const waitingRoleToken = (
  identifiers: DiscordIdentifierView[],
  youtuberId: string
): string | null => {
  const role = identifiers.find(
    (identifier) =>
      identifier.kind === DiscordIdKinds.RecruitmentRole && identifier.youtuberId === youtuberId
  )

  return role ? identifierToken(role.kind, role.discordId) : null
}

/**
 * Tokens of a text no stored identifier answers to
 * @param {string} text - Text as typed
 * @param {MentionEntry[]} entries - Known mentions
 * @return {string[]} - Unknown tokens, once each
 */

export const unknownTokens = (text: string, entries: MentionEntry[]): string[] => {
  const known = new Set(entries.map((entry) => entry.token))
  const found = (text.match(TOKEN_PATTERN) ?? []).map((token) => token.replace('<@!', '<@'))

  return [...new Set(found)].filter((token) => !known.has(token))
}

/**
 * Number inside a token
 * @param {string} token - Mention token
 * @return {string} - Discord snowflake
 */

export const snowflakeOf = (token: string): string => token.replace(/\D/g, '')
