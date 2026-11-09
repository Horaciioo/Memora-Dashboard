import 'server-only'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { readBodyList } from '@/core/lib/play'
import { logger } from '@/core/lib/logger'
import { signalGroups } from '@/core/lib/play/signal'
import { notify } from '@/core/services/system/NotificationService'
import {
  fillPlayMessage,
  PLAY_GROUP_COPY,
  PLAY_GROUP_ERRORS,
  PLAY_SETTINGS,
} from '@/declarations/play'
import type { PlayGroupState } from '@/types/play'
import {
  GROUP_INCLUDE,
  PERSON,
  nameOf,
  requireGroup,
  requireHostGroup,
  tellGroup,
  toView,
} from '@/core/services/play/GroupService/shared'

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
  await notify({
    kind: 'PlayGroupInvited',
    recipients: people.map(({ id }) => id),
    actorId: accountId,
    target: 'playGroup',
    targetId: group.id,
    once: true,
  }).catch((error: unknown) => logger.warn('[play] group invitation not notified', error))
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
