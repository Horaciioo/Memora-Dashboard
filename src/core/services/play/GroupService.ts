import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readBodyList, readBodyText } from '@/core/lib/play'
import { signalGroups } from '@/core/lib/play/signal'
import { createSession } from '@/core/services/play/LobbyService'
import { inviteToSession } from '@/core/services/play/PlayInviteService'
import {
  fillPlayMessage,
  PLAY_GAMES,
  PLAY_GROUP_COPY,
  PLAY_GROUP_ERRORS,
  PLAY_SETTINGS,
} from '@/declarations/play'
import type { PlayGroupState, PlayGroupView } from '@/types/play'
import { PlayInviteRoles, PlayVisibilities } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

const GROUP_INCLUDE = (shown: number) =>
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

const requireHostGroup = async (accountId: string, groupId: string): Promise<LoadedGroup> => {
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

const nameOf = (raw: Record<string, unknown>): string => {
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

const toView = (group: LoadedGroup, accountId: string): PlayGroupView => ({
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

/**
 * Groups and invitations of a member
 * @param {string} accountId - Member
 * @return {Promise<PlayGroupState>} - State of the group tab
 */

export const readPlayGroup = async (accountId: string): Promise<PlayGroupState> => {
  const [groups, invitations] = await Promise.all([
    prisma.playGroup.findMany({
      where: { members: { some: { accountId } } },
      orderBy: { createdAt: 'asc' },
      include: GROUP_INCLUDE(PLAY_SETTINGS.group.messagesShown),
    }),
    prisma.playGroupInvite.findMany({
      where: { inviteeId: accountId },
      orderBy: { createdAt: 'desc' },
      include: { group: { include: { host: PERSON } } },
    }),
  ])

  return {
    groups: groups.map((group) => toView(group, accountId)),
    invitations: invitations.map((invite) => ({
      id: invite.id,
      groupName: invite.group.name,
      host: { name: invite.group.host.displayName, avatarUrl: invite.group.host.avatarUrl },
    })),
  }
}

/**
 * Open a group led by a member
 * @param {string} accountId - Future host
 * @param {Record<string, unknown>} raw - Body, optional name
 * @return {Promise<void>} - Created
 */

export const createPlayGroup = async (
  accountId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const me = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
    select: { displayName: true },
  })
  const count = await prisma.playGroupMember.count({ where: { accountId } })
  if (count >= PLAY_SETTINGS.group.perPlayerMax) throw conflict(PLAY_GROUP_ERRORS.tooMany)
  const name =
    typeof raw.name === 'string' && raw.name.trim()
      ? nameOf(raw)
      : fillPlayMessage(PLAY_GROUP_COPY.defaultName, { name: me.displayName })

  await prisma.playGroup.create({
    data: { name, hostId: accountId, members: { create: { accountId } } },
  })
  await signalGroups([accountId])
}

/**
 * Rename the group
 * @param {string} accountId - Host
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with the name
 * @return {Promise<void>} - Renamed
 */

export const renamePlayGroup = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const group = await requireHostGroup(accountId, groupId)
  await prisma.playGroup.update({ where: { id: group.id }, data: { name: nameOf(raw) } })
  await tellGroup(group)
}

/**
 * Call members into the group
 * @param {string} accountId - Host
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with accountIds
 * @return {Promise<void>} - Invited
 */

export const invitePlayGroup = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const group = await requireHostGroup(accountId, groupId)
  const memberIds = new Set(group.members.map((member) => member.accountId))
  const ids = [...new Set(readBodyList(raw, 'accountIds') ?? [])].filter(
    (id) => id && !memberIds.has(id)
  )
  if (group.members.length + group.invites.length + ids.length > PLAY_SETTINGS.group.sizeMax) {
    throw conflict(PLAY_GROUP_ERRORS.full)
  }

  // Real members only, bots and gone accounts are filtered out
  const people = await prisma.account.findMany({
    where: { id: { in: ids }, leftAt: null, anonymisedAt: null, frozenAt: null },
    select: { id: true },
  })
  await prisma.playGroupInvite.createMany({
    data: people.map(({ id }) => ({ groupId: group.id, inviteeId: id })),
    skipDuplicates: true,
  })
  await signalGroups([...memberIds, ...people.map(({ id }) => id)])
}

/**
 * Answer a call into a group
 * @param {string} inviteId - Invitation
 * @param {string} accountId - Invited member
 * @param {boolean} accept - Join or refuse
 * @return {Promise<void>} - Answered
 */

export const answerGroupInvite = async (
  inviteId: string,
  accountId: string,
  accept: boolean
): Promise<void> => {
  const invite = await prisma.playGroupInvite.findFirst({
    where: { id: inviteId, inviteeId: accountId },
  })
  if (!invite) throw notFound(PLAY_GROUP_ERRORS.invitationGone)

  if (accept) {
    const [mine, size] = await Promise.all([
      prisma.playGroupMember.count({ where: { accountId } }),
      prisma.playGroupMember.count({ where: { groupId: invite.groupId } }),
    ])
    if (mine >= PLAY_SETTINGS.group.perPlayerMax) throw conflict(PLAY_GROUP_ERRORS.tooMany)
    if (size >= PLAY_SETTINGS.group.sizeMax) throw conflict(PLAY_GROUP_ERRORS.full)
    await prisma.$transaction([
      prisma.playGroupMember.create({ data: { groupId: invite.groupId, accountId } }),
      prisma.playGroupInvite.delete({ where: { id: inviteId } }),
    ])
  } else {
    await prisma.playGroupInvite.delete({ where: { id: inviteId } })
  }
  const group = await prisma.playGroup.findUnique({
    where: { id: invite.groupId },
    include: { members: { select: { accountId: true } } },
  })
  await signalGroups([accountId, ...(group?.members.map((member) => member.accountId) ?? [])])
}

/**
 * Take a member out of the group, or let one leave it
 * @param {string} actorId - Host removing, or the member leaving
 * @param {string} groupId - Group
 * @param {string} memberId - Member going
 * @return {Promise<void>} - Done
 */

export const removeFromGroup = async (
  actorId: string,
  groupId: string,
  memberId: string
): Promise<void> => {
  const group = await requireGroup(actorId, groupId)
  if (!group.members.some((member) => member.accountId === memberId)) {
    throw notFound(PLAY_GROUP_ERRORS.notMember)
  }
  const isSelf = actorId === memberId
  if (!isSelf && group.hostId !== actorId) throw forbidden(PLAY_GROUP_ERRORS.hostOnly)
  if (!isSelf && memberId === group.hostId) throw conflict(PLAY_GROUP_ERRORS.hostStays)

  const rest = group.members.filter((member) => member.accountId !== memberId)
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.playGroupMember.delete({
      where: { groupId_accountId: { groupId: group.id, accountId: memberId } },
    })
    await tx.playGroupProposal.deleteMany({ where: { groupId: group.id, accountId: memberId } })
    if (rest.length === 0) await tx.playGroup.delete({ where: { id: group.id } })
    // The oldest member takes over when the host goes
    else if (memberId === group.hostId) {
      await tx.playGroup.update({ where: { id: group.id }, data: { hostId: rest[0].accountId } })
    }
  })
  await tellGroup(group)
}

/**
 * Dissolve the group
 * @param {string} accountId - Host
 * @param {string} groupId - Group
 * @return {Promise<void>} - Deleted
 */

export const dissolvePlayGroup = async (accountId: string, groupId: string): Promise<void> => {
  const group = await requireHostGroup(accountId, groupId)
  await prisma.playGroup.delete({ where: { id: group.id } })
  await tellGroup(group)
}

/**
 * Propose a game to the group, or take the proposal back
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with the game
 * @return {Promise<void>} - Toggled
 */

export const proposeGroupGame = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const group = await requireGroup(accountId, groupId)
  const game = gameOf(raw)
  const where = { groupId_accountId_game: { groupId: group.id, accountId, game } }
  if (await prisma.playGroupProposal.findUnique({ where })) {
    await prisma.playGroupProposal.delete({ where })
  } else {
    await prisma.playGroupProposal.create({ data: { groupId: group.id, accountId, game } })
  }
  await tellGroup(group)
}

/**
 * Game named in a body, playable only
 * @param {Record<string, unknown>} raw - Body
 * @return {PlayGameName} - Game
 */

const gameOf = (raw: Record<string, unknown>): PlayGameName => {
  const name = readBodyText(raw, 'game', PLAY_GROUP_ERRORS.notProposed)
  const game = PLAY_GAMES.keys.find((key) => key === name)
  if (!game || !PLAY_GAMES.get(game).playable) throw notFound(PLAY_GROUP_ERRORS.notProposed)

  return game
}

/**
 * Drop a proposal, by its author or the host
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @param {string} proposalId - Proposal
 * @return {Promise<void>} - Dropped
 */

export const dropGroupProposal = async (
  accountId: string,
  groupId: string,
  proposalId: string
): Promise<void> => {
  const group = await requireGroup(accountId, groupId)
  const proposal = group.proposals.find((entry) => entry.id === proposalId)
  if (!proposal) throw notFound(PLAY_GROUP_ERRORS.notProposed)
  if (proposal.accountId !== accountId && group.hostId !== accountId) {
    throw forbidden(PLAY_GROUP_ERRORS.hostOnly)
  }
  await prisma.playGroupProposal.delete({ where: { id: proposalId } })
  await tellGroup(group)
}

/**
 * Open a private table for the group, call everyone in and post it in the chat
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with the game
 * @return {Promise<{ id: string }>} - Table
 */

export const launchGroupGame = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<{ id: string }> => {
  const group = await requireGroup(accountId, groupId)
  const game = gameOf(raw)
  const session = await createSession(accountId, { game, visibility: PlayVisibilities.Private })
  const others = group.members.map((member) => member.accountId).filter((id) => id !== accountId)
  if (others.length > 0) {
    await inviteToSession(session.id, accountId, {
      role: PlayInviteRoles.Player,
      accountIds: others,
    })
  }
  await prisma.playGroupProposal.deleteMany({ where: { groupId: group.id, game } })
  await prisma.playGroupMessage.create({
    data: {
      groupId: group.id,
      accountId,
      body: PLAY_GROUP_COPY.invitedToPlay,
      game,
      sessionId: session.id,
    },
  })
  await tellGroup(group)

  return session
}

/**
 * Members a host can still call into each of the groups they lead
 * @param {string} accountId - Host
 * @return {Promise<Record<string, { id: string; displayName: string; avatarUrl: string | null }[]>>} - People per group
 */

export const listGroupCandidates = async (accountId: string) => {
  const groups = await prisma.playGroup.findMany({
    where: { hostId: accountId },
    select: {
      id: true,
      members: { select: { accountId: true } },
      invites: { select: { inviteeId: true } },
    },
  })
  if (groups.length === 0) return {}

  const people = await prisma.account.findMany({
    where: { leftAt: null, anonymisedAt: null, frozenAt: null },
    select: { id: true, displayName: true, avatarUrl: true },
    orderBy: { displayName: 'asc' },
  })

  return Object.fromEntries(
    groups.map((group) => {
      const taken = new Set([
        ...group.members.map((member) => member.accountId),
        ...group.invites.map((invite) => invite.inviteeId),
      ])

      return [group.id, people.filter((person) => !taken.has(person.id))]
    })
  )
}
