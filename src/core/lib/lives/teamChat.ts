import { TEAM_MENTIONS, TEAM_MENTION_KINDS } from '@/declarations/lives/teamChat'
import { TEAM_CHAT_SCOPES, TEAM_CHAT_SCOPE_MENTIONS } from '@/declarations/lives/teamChat'
import type { TeamChatScope, TeamMentionKind } from '@/declarations/lives/teamChat'
import type { LivePerson, LiveTeamReaction } from '@/types/lives'

/**
 * Seats a mention is read against
 * @typedef {Object} MentionSeats
 * @property {LivePerson[]} members - Convened team
 * @property {string[]} coordinatorIds - Coordinating now
 * @property {string} designatedId - Designated member, empty when none
 */

export interface MentionSeats {
  members: LivePerson[]
  coordinatorIds: string[]
  designatedId: string
}

/**
 * Mention kinds written in a text, as @label
 * @param {string} body - Text
 * @param {Partial<Record<TeamMentionKind, string>>} [labels] - Label overrides
 * @param {TeamChatScope} [scope] - Room written in, bounds the kinds
 * @return {TeamMentionKind[]} - Kinds called
 */

export const mentionsIn = (
  body: string,
  labels: Partial<Record<TeamMentionKind, string>> = {},
  scope: TeamChatScope = 'all'
): TeamMentionKind[] => {
  const text = body.toLocaleLowerCase()

  return cleanMentions(TEAM_MENTION_KINDS, scope).filter((kind) =>
    text.includes(`@${(labels[kind] ?? TEAM_MENTIONS[kind].label).toLocaleLowerCase()}`)
  )
}

/**
 * Whether a member is called by some mentions
 * @param {TeamMentionKind[]} mentions - Kinds called
 * @param {string} accountId - Member
 * @param {MentionSeats} seats - Team of the live
 * @param {TeamChatScope} [scope] - Room, outsiders of the referents room are never called
 * @return {boolean} - Called
 */

export const isCalled = (
  mentions: TeamMentionKind[],
  accountId: string,
  seats: MentionSeats,
  scope: TeamChatScope = 'all'
): boolean => {
  const member = seats.members.find((seat) => seat.id === accountId)
  if (!canSeeScope(member, scope)) return false
  const rank = member?.rank
  const matches: Record<TeamMentionKind, boolean> = {
    everyone: true,
    team: rank === 'moderator',
    coordinator: seats.coordinatorIds.includes(accountId),
    responsables: rank === 'responsable' || rank === 'admin',
    admins: rank === 'admin',
    designated: seats.designatedId !== '' && seats.designatedId === accountId,
  }

  return cleanMentions(mentions, scope).some((kind) => matches[kind])
}

/**
 * Keep only known mention kinds the room can call
 * @param {unknown} value - Raw list
 * @param {TeamChatScope} [scope] - Room
 * @return {TeamMentionKind[]} - Valid kinds, once each
 */

export const cleanMentions = (value: unknown, scope: TeamChatScope = 'all'): TeamMentionKind[] =>
  Array.isArray(value)
    ? TEAM_MENTION_KINDS.filter(
        (kind) => value.includes(kind) && TEAM_CHAT_SCOPE_MENTIONS[scope].includes(kind)
      )
    : []

/**
 * Piece of a message, a mention or plain text
 * @typedef {Object} MentionSegment
 * @property {string} text - Text
 * @property {boolean} isMention - Called a group
 */

export interface MentionSegment {
  text: string
  isMention: boolean
}

/**
 * Cut a message around its mentions
 * @param {string} body - Text
 * @param {string[]} labels - Labels that can follow @
 * @return {MentionSegment[]} - Pieces in order
 */

export const mentionSegments = (body: string, labels: string[]): MentionSegment[] => {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!escaped.length) return [{ text: body, isMention: false }]

  return body
    .split(new RegExp(`(@(?:${escaped.join('|')}))`, 'i'))
    .map((text, index) => ({ text, isMention: index % 2 === 1 }))
    .filter((segment) => segment.text !== '')
}

/**
 * Room named by a raw value
 * @param {unknown} value - Raw room
 * @return {TeamChatScope} - Known room, all otherwise
 */

export const cleanScope = (value: unknown): TeamChatScope =>
  TEAM_CHAT_SCOPES.find((scope) => scope === value) ?? 'all'

/**
 * Reaction rows gathered per emoji, in order of first use
 * @param {{ emoji: string, accountId: string }[]} rows - One row per member and emoji
 * @return {LiveTeamReaction[]} - One entry per emoji
 */

export const groupReactions = (
  rows: { emoji: string; accountId: string }[]
): LiveTeamReaction[] => {
  const byEmoji = new Map<string, string[]>()
  for (const row of rows) byEmoji.set(row.emoji, [...(byEmoji.get(row.emoji) ?? []), row.accountId])

  return [...byEmoji].map(([emoji, accountIds]) => ({ emoji, accountIds }))
}

/**
 * Whether a teammate reads a room, shown on the tabs
 * @param {LivePerson | undefined} member - Teammate
 * @param {TeamChatScope} scope - Room
 * @return {boolean} - Room open to them
 */

export const canSeeScope = (member: LivePerson | undefined, scope: TeamChatScope): boolean => {
  if (scope === 'all') return true
  if (scope === 'referents') return canSeeReferents(member)

  return member?.rank === 'responsable' || member?.rank === 'admin'
}

/**
 * Whether a teammate reads the referents room
 * @param {LivePerson | undefined} member - Teammate
 * @return {boolean} - Referent, responsable or above
 */

export const canSeeReferents = (member: LivePerson | undefined): boolean =>
  member?.isReferent === true || member?.rank === 'responsable' || member?.rank === 'admin'
