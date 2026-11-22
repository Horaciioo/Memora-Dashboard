import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { signalNotices } from '@/core/lib/play/signal'
import {
  findTie,
  PERSON,
  REAL_MEMBER,
  refuseTwice,
  relationOf,
  requireMember,
  toPerson,
} from '@/core/services/play/FriendService/shared'
import { PLAY_ERRORS, PLAY_FRIENDS_ERRORS, PLAY_SETTINGS } from '@/declarations/play'
import type { PlayFriendFound, PlayFriendsState } from '@/types/play'

// Fields of a friend
const WITH_PEOPLE = {
  requester: { select: { ...PERSON.select, playProfile: { select: { lastSeenAt: true } } } },
  addressee: { select: { ...PERSON.select, playProfile: { select: { lastSeenAt: true } } } },
} as const

/**
 * Friends and requests of a player
 * @param {string} accountId - Player
 * @return {Promise<PlayFriendsState>} - Friends, requests in and out
 */

export const readPlayFriends = async (accountId: string): Promise<PlayFriendsState> => {
  const rows = await prisma.playFriendship.findMany({
    where: {
      OR: [{ requesterId: accountId }, { addresseeId: accountId }],
      requester: REAL_MEMBER,
      addressee: REAL_MEMBER,
    },
    orderBy: { createdAt: 'desc' },
    include: WITH_PEOPLE,
  })
  const state: PlayFriendsState = { friends: [], incoming: [], outgoing: [] }

  // Sorted by tie
  for (const row of rows) {
    const isMine = row.requesterId === accountId
    const other = isMine ? row.addressee : row.requester
    if (row.acceptedAt) {
      state.friends.push({
        ...toPerson(other),
        lastSeenAt: other.playProfile?.lastSeenAt?.toISOString() ?? null,
        since: row.acceptedAt.toISOString(),
      })
      continue
    }
    const request = {
      ...toPerson(other),
      requestId: row.id,
      createdAt: row.createdAt.toISOString(),
    }
    if (isMine) state.outgoing.push(request)
    else state.incoming.push(request)
  }

  return state
}

/**
 * Members whose name holds the words, with their tie
 * @param {string} accountId - Viewer
 * @param {string} term - Words typed
 * @return {Promise<PlayFriendFound[]>} - Matches
 */

export const searchPlayPlayers = async (
  accountId: string,
  term: string
): Promise<PlayFriendFound[]> => {
  const words = term.trim()
  if (words.length < PLAY_SETTINGS.friends.searchMin) return []
  const people = await prisma.account.findMany({
    where: {
      id: { not: accountId },
      displayName: { contains: words, mode: 'insensitive' },
      ...REAL_MEMBER,
    },
    select: PERSON.select,
    orderBy: { displayName: 'asc' },
    take: PLAY_SETTINGS.friends.searchSize,
  })
  const ties = await prisma.playFriendship.findMany({
    where: {
      OR: [
        { requesterId: accountId, addresseeId: { in: people.map(({ id }) => id) } },
        { addresseeId: accountId, requesterId: { in: people.map(({ id }) => id) } },
      ],
    },
  })

  return people.map((person) => {
    const tie = ties.find((row) => row.requesterId === person.id || row.addresseeId === person.id)

    return {
      ...toPerson(person),
      relation: relationOf(accountId, tie ?? null),
      requestId: tie?.id ?? null,
    }
  })
}

/**
 * Ask a player, or answer theirs at once
 * @param {string} accountId - Asker
 * @param {Record<string, unknown>} raw - Body with accountId
 * @return {Promise<void>} - Asked
 */

export const requestPlayFriend = async (
  accountId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const otherId = readBodyText(raw, 'accountId', PLAY_FRIENDS_ERRORS.unknown)
  if (otherId === accountId) throw conflict(PLAY_FRIENDS_ERRORS.self)
  await requireMember(otherId)
  const count = await prisma.playFriendship.count({
    where: {
      acceptedAt: { not: null },
      OR: [{ requesterId: accountId }, { addresseeId: accountId }],
    },
  })
  if (count >= PLAY_SETTINGS.friends.max) throw conflict(PLAY_FRIENDS_ERRORS.full)

  // Their request waiting becomes a friendship
  const tie = await findTie(accountId, otherId)
  if (tie?.addresseeId === accountId && !tie.acceptedAt) {
    await prisma.playFriendship.update({ where: { id: tie.id }, data: { acceptedAt: new Date() } })
  } else {
    refuseTwice(tie)
    await prisma.playFriendship.create({ data: { requesterId: accountId, addresseeId: otherId } })
  }
  await signalNotices([accountId, otherId])
}

/**
 * Accept or refuse a request received
 * @param {string} requestId - Friendship row
 * @param {string} accountId - Player asked
 * @param {boolean} accept - Accept or refuse
 * @return {Promise<void>} - Answered
 */

export const answerPlayFriend = async (
  requestId: string,
  accountId: string,
  accept: boolean
): Promise<void> => {
  const row = await prisma.playFriendship.findFirst({
    where: { id: requestId, addresseeId: accountId, acceptedAt: null },
  })
  if (!row) throw notFound(PLAY_FRIENDS_ERRORS.gone)
  if (accept) {
    await prisma.playFriendship.update({ where: { id: row.id }, data: { acceptedAt: new Date() } })
  } else {
    await prisma.playFriendship.delete({ where: { id: row.id } })
  }
  await signalNotices([accountId, row.requesterId])
}

/**
 * End a friendship or take a request back
 * @param {string} accountId - Player
 * @param {string} otherId - Friend or asked player
 * @return {Promise<void>} - Removed
 */

export const removePlayFriend = async (accountId: string, otherId: string): Promise<void> => {
  const tie = await findTie(accountId, otherId)
  if (!tie) throw notFound(PLAY_ERRORS.unknownPlayer)
  await prisma.playFriendship.delete({ where: { id: tie.id } })
  await signalNotices([accountId, otherId])
}

/**
 * Tie of the viewer with a player
 * @param {string} viewerId - Viewer
 * @param {string} otherId - Player
 * @return {Promise<Pick<PlayFriendFound, 'relation' | 'requestId'>>} - Relation
 */

export const readPlayRelation = async (
  viewerId: string,
  otherId: string
): Promise<Pick<PlayFriendFound, 'relation' | 'requestId'>> => {
  if (viewerId === otherId) return { relation: 'self', requestId: null }
  const tie = await findTie(viewerId, otherId)

  return { relation: relationOf(viewerId, tie), requestId: tie?.id ?? null }
}
