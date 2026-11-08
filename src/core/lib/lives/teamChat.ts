import { TEAM_MENTIONS, TEAM_MENTION_KINDS } from '@/declarations/lives/teamChat'
import type { TeamMentionKind } from '@/declarations/lives/teamChat'
import type { LivePerson } from '@/types/lives'

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
 * @return {TeamMentionKind[]} - Kinds called
 */

export const mentionsIn = (
  body: string,
  labels: Partial<Record<TeamMentionKind, string>> = {}
): TeamMentionKind[] => {
  const text = body.toLocaleLowerCase()

  return TEAM_MENTION_KINDS.filter((kind) =>
    text.includes(`@${(labels[kind] ?? TEAM_MENTIONS[kind].label).toLocaleLowerCase()}`)
  )
}

/**
 * Whether a member is called by some mentions
 * @param {TeamMentionKind[]} mentions - Kinds called
 * @param {string} accountId - Member
 * @param {MentionSeats} seats - Team of the live
 * @return {boolean} - Called
 */

export const isCalled = (
  mentions: TeamMentionKind[],
  accountId: string,
  seats: MentionSeats
): boolean => {
  const rank = seats.members.find((member) => member.id === accountId)?.rank
  const matches: Record<TeamMentionKind, boolean> = {
    everyone: true,
    team: rank === 'moderator',
    coordinator: seats.coordinatorIds.includes(accountId),
    responsables: rank === 'responsable' || rank === 'admin',
    designated: seats.designatedId !== '' && seats.designatedId === accountId,
  }

  return mentions.some((kind) => matches[kind])
}

/**
 * Keep only known mention kinds
 * @param {unknown} value - Raw list
 * @return {TeamMentionKind[]} - Valid kinds, once each
 */

export const cleanMentions = (value: unknown): TeamMentionKind[] =>
  Array.isArray(value) ? TEAM_MENTION_KINDS.filter((kind) => value.includes(kind)) : []

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
