import type { ChatLine } from '@/declarations/academy/curriculum/types'

/**
 * Pseudonym colours of a chat
 * @type {readonly string[]}
 */

export const CHAT_NAME_COLORS: readonly string[] = [
  '#ff7f50',
  '#1e90ff',
  '#00ff7f',
  '#daa520',
  '#ff69b4',
  '#9acd32',
  '#b57edc',
  '#5f9ea0',
]

/**
 * Badge drawn before a name
 * @typedef {Object} ChatRoleBadge
 * @property {string} label - Text of the badge
 * @property {string} colour - CSS colour of its ground
 */

export interface ChatRoleBadge {
  label: string
  colour: string
}

/**
 * Badge of each role that carries one
 * @type {Record<string, ChatRoleBadge>}
 */

export const CHAT_ROLE_BADGES: Record<NonNullable<ChatLine['role']>, ChatRoleBadge | null> = {
  viewer: null,
  moderator: { label: 'Mod', colour: 'var(--chat-moderator)' },
  creator: { label: 'Créa', colour: 'var(--chat-creator)' },
  vip: { label: 'VIP', colour: 'var(--chat-vip)' },
  bot: { label: 'Bot', colour: 'var(--chat-bot)' },
}

/**
 * Colour of one pseudonym
 * @param {string} author - Pseudonym
 * @return {string} - CSS colour
 */

export const nameColour = (author: string): string => {
  const seed = [...author].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return CHAT_NAME_COLORS[seed % CHAT_NAME_COLORS.length]!
}
