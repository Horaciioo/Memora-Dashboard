import { createRegistry } from '@/core/lib/registry'
import { DiscordAnchorKinds } from '@/utils/constants/moderation'
import type { DiscordAnchorKindName } from '@/utils/constants/moderation'

/**
 * Anchor kind metadata
 * @typedef {Object} DiscordAnchorOption
 * @property {string} label - Display name
 * @property {string} group - Heading in the mention list
 * @property {string} sigil - Character typed before its name
 * @property {(id: string) => string} token - Mention Discord reads
 */

interface DiscordAnchorOption {
  label: string
  group: string
  sigil: string
  token: (id: string) => string
}

const DISCORD_ANCHOR_MAP: Record<DiscordAnchorKindName, DiscordAnchorOption> = {
  [DiscordAnchorKinds.Role]: {
    label: 'Rôle',
    group: 'Rôles',
    sigil: '@',
    token: (id) => `<@&${id}>`,
  },
  [DiscordAnchorKinds.Channel]: {
    label: 'Salon',
    group: 'Salons',
    sigil: '#',
    token: (id) => `<#${id}>`,
  },
}

export const DISCORD_ANCHOR_REGISTRY = createRegistry(DISCORD_ANCHOR_MAP)

/**
 * Member mention Discord reads
 * @param {string} id - Discord identifier
 * @return {string} - Mention token
 */

export const memberToken = (id: string): string => `<@${id}>`

/**
 * Mentions every server knows
 * @type {readonly string[]}
 */

export const BROADCAST_MENTIONS: readonly string[] = ['@everyone', '@here']
