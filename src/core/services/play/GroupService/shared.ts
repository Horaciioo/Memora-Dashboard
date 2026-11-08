import 'server-only'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { signalGroups } from '@/core/lib/play/signal'
import { PLAY_GROUP_ERRORS, PLAY_SETTINGS } from '@/declarations/play'
import type { PlayGroupView } from '@/types/play'

export const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

export const GROUP_INCLUDE = (shown: number) =>
  ({
    members: { orderBy: { joinedAt: 'asc' }, include: { account: PERSON } },
    invites: { orderBy: { createdAt: 'asc' }, include: { invitee: PERSON } },
    proposals: { orderBy: { createdAt: 'asc' }, include: { account: PERSON } },
    messages: { orderBy: { createdAt: 'desc' }, take: shown, include: { account: PERSON } },
  }) satisfies Prisma.PlayGroupInclude

const loadGroup = (id: string) =>
  prisma.playGroup.findUnique({
    where: { id },
    include: GROUP_INCLUDE(PLAY_SETTINGS.group.messagesShown),
  })

type LoadedGroup = NonNullable<Awaited<ReturnType<typeof loadGroup>>>

/**
 * Group where a member sits, refusing a stranger
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @return {Promise<LoadedGroup>} - Group
 */

export const requireGroup = async (accountId: string, groupId: string): Promise<LoadedGroup> => {
  const group = await loadGroup(groupId)
  if (!group) throw notFound(PLAY_GROUP_ERRORS.missing)
  if (!group.members.some((member) => member.accountId === accountId)) {
    throw notFound(PLAY_GROUP_ERRORS.notMember)
  }

  return group
}

/**
 * Group of a member, refusing anyone but its host
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @return {Promise<LoadedGroup>} - Group
 */

export const requireHostGroup = async (
  accountId: string,
  groupId: string
): Promise<LoadedGroup> => {
  const group = await requireGroup(accountId, groupId)
  if (group.hostId !== accountId) throw forbidden(PLAY_GROUP_ERRORS.hostOnly)

  return group
}

/**
 * Tell everyone a group touches to read it again
 * @param {LoadedGroup} group - Group
 * @param {string[]} [extra] - Others to tell, a member just removed
 * @return {Promise<void>} - Sent
 */

export const tellGroup = (group: LoadedGroup, extra: string[] = []): Promise<void> =>
  signalGroups([
    ...group.members.map((member) => member.accountId),
    ...group.invites.map((invite) => invite.inviteeId),
    ...extra,
  ])

/**
 * Name as typed, trimmed and bounded
 * @param {Record<string, unknown>} raw - Body
 * @return {string} - Name
 */

export const nameOf = (raw: Record<string, unknown>): string => {
  const name = readBodyText(raw, 'name', PLAY_GROUP_ERRORS.name)
  if (name.length > PLAY_SETTINGS.group.nameMax) {
    throw invalidInput([{ field: 'name', message: PLAY_GROUP_ERRORS.nameLong }])
  }

  return name
}

/**
 * Group as the viewer reads it
 * @param {LoadedGroup} group - Group
 * @param {string} accountId - Viewer
 * @return {PlayGroupView} - View
 */

export const toView = (group: LoadedGroup, accountId: string): PlayGroupView => ({
  id: group.id,
  name: group.name,
  isHost: group.hostId === accountId,
  members: group.members.map(({ account }) => ({
    accountId: account.id,
    name: account.displayName,
    avatarUrl: account.avatarUrl,
    isHost: account.id === group.hostId,
    isMe: account.id === accountId,
  })),
  invited: group.invites.map(({ invitee }) => ({
    accountId: invitee.id,
    name: invitee.displayName,
    avatarUrl: invitee.avatarUrl,
  })),
  proposals: group.proposals.map((proposal) => ({
    id: proposal.id,
    game: proposal.game,
    by: { name: proposal.account.displayName, avatarUrl: proposal.account.avatarUrl },
    isMine: proposal.accountId === accountId,
  })),
  // Stored newest first, read oldest first
  messages: [...group.messages].reverse().map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    game: message.game,
    sessionId: message.sessionId,
    author: {
      accountId: message.account.id,
      name: message.account.displayName,
      avatarUrl: message.account.avatarUrl,
    },
    isMine: message.accountId === accountId,
  })),
})
