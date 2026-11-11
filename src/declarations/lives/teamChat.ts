import type { ComponentType } from 'react'

import { ReferentFunctionGlyph } from '@/components/elements/display/glyphs/BrandGlyphs'
import { ROLE_EMBLEMS } from '@/declarations/members/profiles'
import { ICONS } from '@/declarations/ui/icons'
import { MemberRoles } from '@/utils/constants/hierarchy'

/**
 * Group a message can call
 * @typedef {'everyone' | 'team' | 'coordinator' | 'responsables' | 'admins' | 'designated'} TeamMentionKind
 */

export type TeamMentionKind =
  'everyone' | 'team' | 'coordinator' | 'responsables' | 'admins' | 'designated'

/**
 * Mention targets, the label is what the author types after @
 * @type {Record<TeamMentionKind, { label: string }>}
 */

export const TEAM_MENTIONS: Record<TeamMentionKind, { label: string }> = {
  everyone: { label: 'Tous' },
  team: { label: 'Twitch' },
  responsables: { label: 'Responsable' },
  coordinator: { label: 'Coordinateur' },
  admins: { label: 'Admin' },
  designated: { label: 'Référent' },
}

// Mention kinds in menu order
export const TEAM_MENTION_KINDS = Object.keys(TEAM_MENTIONS) as TeamMentionKind[]

/**
 * Event names of the team topic
 * @type {{ message: string }}
 */

export const TEAM_CHAT_EVENTS = {
  message: 'message',
  typing: 'typing',
  reactions: 'reactions',
} as const

/**
 * Room of an internal message
 * @typedef {'all' | 'referents' | 'responsables'} TeamChatScope
 */

export type TeamChatScope = 'all' | 'referents' | 'responsables'

// Rooms in tab order
export const TEAM_CHAT_SCOPES: TeamChatScope[] = ['all', 'referents', 'responsables']

/**
 * Groups each room can call, the referents room never reaches outsiders
 * @type {Record<TeamChatScope, TeamMentionKind[]>}
 */

export const TEAM_CHAT_SCOPE_MENTIONS: Record<TeamChatScope, TeamMentionKind[]> = {
  all: ['everyone', 'team', 'responsables', 'coordinator', 'designated'],
  referents: ['responsables', 'admins', 'coordinator'],
  responsables: ['responsables', 'admins'],
}

/**
 * Tab label of each room
 * @type {Record<TeamChatScope, string>}
 */

export const TEAM_CHAT_SCOPE_LABELS: Record<TeamChatScope, string> = {
  all: 'Tous',
  referents: 'Référents',
  responsables: 'Responsables',
}

/**
 * Emoji offered as a reaction, Discord style
 * @type {string[]}
 */

export const TEAM_CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👀']

// Emoji one click away on the floating bar
export const TEAM_CHAT_QUICK = ['❤️', '👍', '🔥']

/**
 * Glyph of each room tab, the label only serves screen readers
 * @type {Record<TeamChatScope, ComponentType<{ className?: string }>>}
 */

export const TEAM_CHAT_SCOPE_ICONS: Record<TeamChatScope, ComponentType<{ className?: string }>> = {
  all: ROLE_EMBLEMS[MemberRoles.Moderateur].glyph,
  referents: ReferentFunctionGlyph,
  responsables: ICONS.legacy,
}

/**
 * Tint of each room, the one of its tab glyph, read as --room
 * @type {Record<TeamChatScope, 'DIVISION' | 'REFERENT' | 'RESPONSABLE'>}
 */

export const TEAM_CHAT_SCOPE_TINTS = {
  all: 'DIVISION',
  referents: 'REFERENT',
  responsables: 'RESPONSABLE',
} as const satisfies Record<TeamChatScope, string>

// Longest emoji string accepted from the browser
export const TEAM_CHAT_EMOJI_MAX = 16

/**
 * Texts of the internal chat
 * @type {Record<string, string>}
 */

export const TEAM_CHAT_COPY = {
  title: 'Chat interne',
  placeholder: 'Écris à l’équipe',
  offline: 'Le chat interne est disponible pendant un live.',
  locked: 'Le chat interne n’envoie rien tant que le live n’a pas commencé.',
  send: 'Envoyer',
  mention: 'Mentionner',
  empty: 'Aucun message pour ce live',
  emptyBody: 'Les messages restent entre les membres de l’équipe.',
  emptyReferents: 'Aucun message entre référents',
  emptyReferentsBody: 'Seuls les référents, les responsables et les admins voient ce salon.',
  emptyResponsables: 'Aucun message entre responsables',
  emptyResponsablesBody: 'Seuls les responsables et les admins voient ce salon.',
  older: 'Voir plus ancien',
  unread: 'Nouveaux messages',
  mentioned: '{author} t’a mentionné',
  mentionedTip: '{author} t’a mentionné !',
  you: 'Toi',
  unknown: 'Membre',
  failed: 'Message non envoyé',
  scopes: 'Salon du chat',
  react: 'Réagir',
  reactionOf: '{emoji} par {names}',
  typingOne: '{names} est en train d’écrire',
  typingMany: '{names} sont en train d’écrire',
  typingAria: 'Écriture en cours',
} as const

/**
 * Empty state text of each room
 * @type {Record<TeamChatScope, { title: string, body: string }>}
 */

export const TEAM_CHAT_EMPTY: Record<TeamChatScope, { title: string; body: string }> = {
  all: { title: TEAM_CHAT_COPY.empty, body: TEAM_CHAT_COPY.emptyBody },
  referents: { title: TEAM_CHAT_COPY.emptyReferents, body: TEAM_CHAT_COPY.emptyReferentsBody },
  responsables: {
    title: TEAM_CHAT_COPY.emptyResponsables,
    body: TEAM_CHAT_COPY.emptyResponsablesBody,
  },
}
