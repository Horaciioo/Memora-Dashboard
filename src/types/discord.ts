import type { DiscordIdKindName } from '@/utils/constants/discord'

/**
 * Discord identifier Memora knows
 * @typedef {Object} DiscordIdentifierView
 * @property {string} id - Row identifier
 * @property {string} discordId - Discord snowflake
 * @property {DiscordIdKindName} kind - What it points at
 * @property {string} name - Name shown instead of the number
 * @property {string | null} youtuberId - Creator it belongs to
 */

export interface DiscordIdentifierView {
  id: string
  discordId: string
  kind: DiscordIdKindName
  name: string
  youtuberId: string | null
}
