import { createRegistry } from '@/core/lib/registry'
import { DiscordIdKinds } from '@/utils/constants/discord'
import type { DiscordIdKindName } from '@/utils/constants/discord'

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

/**
 * Shape of the token Discord reads for a kind
 * @type {'member' | 'role' | 'channel' | null}
 */

export type DiscordMentionShape = 'member' | 'role' | 'channel' | null

/**
 * Display data of one identifier kind
 * @typedef {Object} DiscordIdKindOption
 * @property {string} label - Display label
 * @property {string} accent - Colour token
 * @property {DiscordMentionShape} mention - Token shape, null when not mentionable
 */

interface DiscordIdKindOption {
  label: string
  accent: string
  mention: DiscordMentionShape
}

const DISCORD_ID_KIND_MAP: Record<DiscordIdKindName, DiscordIdKindOption> = {
  [DiscordIdKinds.Member]: { label: 'Membre', accent: 'info', mention: 'member' },
  [DiscordIdKinds.Role]: { label: 'Rôle', accent: 'neutral', mention: 'role' },
  [DiscordIdKinds.AcademyRole]: { label: 'Rôle académique', accent: 'success', mention: 'role' },
  [DiscordIdKinds.RecruitmentRole]: {
    label: 'Rôle de recrutement',
    accent: 'warning',
    mention: 'role',
  },
  [DiscordIdKinds.TextChannel]: { label: 'Salon textuel', accent: 'brand', mention: 'channel' },
  [DiscordIdKinds.VoiceChannel]: { label: 'Salon vocal', accent: 'brand', mention: 'channel' },
  [DiscordIdKinds.Server]: { label: 'Serveur', accent: 'neutral', mention: null },
}

export const DISCORD_ID_KIND_REGISTRY = createRegistry(DISCORD_ID_KIND_MAP)

/**
 * Token Discord reads for a stored identifier
 * @param {DiscordIdKindName} kind - What it points at
 * @param {string} id - Discord identifier
 * @return {string | null} - Token, null when not mentionable
 */

export const identifierToken = (kind: DiscordIdKindName, id: string): string | null => {
  const shape = DISCORD_ID_KIND_REGISTRY.get(kind).mention
  if (shape === null) return null

  return { member: `<@${id}>`, role: `<@&${id}>`, channel: `<#${id}>` }[shape]
}

/**
 * Kind a token most likely points at
 * @param {string} token - Mention token
 * @return {DiscordIdKindName} - Suggested kind
 */

export const kindOfToken = (token: string): DiscordIdKindName => {
  if (token.startsWith('<@&')) return DiscordIdKinds.Role
  if (token.startsWith('<#')) return DiscordIdKinds.TextChannel

  return DiscordIdKinds.Member
}

/**
 * Kind families the console groups rows by
 * @typedef {Object} DiscordIdGroup
 * @property {string} key - Group key
 * @property {string} label - Heading and filter label
 * @property {readonly DiscordIdKindName[]} kinds - Kinds gathered
 */

export interface DiscordIdGroup {
  key: string
  label: string
  kinds: readonly DiscordIdKindName[]
}

/**
 * Console groups in display order, members last
 * @type {DiscordIdGroup[]}
 */

export const DISCORD_ID_GROUPS: DiscordIdGroup[] = [
  { key: 'servers', label: 'Serveurs', kinds: [DiscordIdKinds.Server] },
  {
    key: 'roles',
    label: 'Rôles',
    kinds: [DiscordIdKinds.Role, DiscordIdKinds.AcademyRole, DiscordIdKinds.RecruitmentRole],
  },
  {
    key: 'channels',
    label: 'Salons',
    kinds: [DiscordIdKinds.TextChannel, DiscordIdKinds.VoiceChannel],
  },
  { key: 'members', label: 'Membres', kinds: [DiscordIdKinds.Member] },
]
