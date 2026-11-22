import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { PLAY_FRIENDS_ERRORS } from '@/declarations/play'
import type { PlayPerson, PlayRelation } from '@/types/play'

// Fields shown of a player
export const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

// Real members only
export const REAL_MEMBER = {
  leftAt: null,
  anonymisedAt: null,
  frozenAt: null,
  botKind: null,
} as const

/**
 * Person shown
 * @param {{ id: string, displayName: string, avatarUrl: string | null }} account - Account row
 * @return {PlayPerson} - Person
 */

export const toPerson = (account: {
  id: string
  displayName: string
  avatarUrl: string | null
}): PlayPerson => ({ id: account.id, name: account.displayName, avatarUrl: account.avatarUrl })

/**
 * Row tying two players, whoever asked
 * @param {string} first - Player
 * @param {string} second - Other player
 * @return {Promise<Awaited<ReturnType<typeof prisma.playFriendship.findFirst>>>} - Row or none
 */

export const findTie = (first: string, second: string) =>
  prisma.playFriendship.findFirst({
    where: {
      OR: [
        { requesterId: first, addresseeId: second },
        { requesterId: second, addresseeId: first },
      ],
    },
  })

/**
 * Tie read from the viewer side
 * @param {string} viewerId - Viewer
 * @param {Awaited<ReturnType<typeof findTie>>} tie - Row or none
 * @return {PlayRelation} - Relation
 */

export const relationOf = (
  viewerId: string,
  tie: Awaited<ReturnType<typeof findTie>>
): PlayRelation => {
  if (!tie) return 'none'
  if (tie.acceptedAt) return 'friend'

  return tie.requesterId === viewerId ? 'outgoing' : 'incoming'
}

/**
 * Real member who can be asked
 * @param {string} accountId - Player
 * @return {Promise<void>} - Resolved when found
 */

export const requireMember = async (accountId: string): Promise<void> => {
  const member = await prisma.account.findFirst({
    where: { id: accountId, ...REAL_MEMBER },
    select: { id: true },
  })
  if (!member) throw notFound(PLAY_FRIENDS_ERRORS.unknown)
}

/**
 * Refuse a second friendship
 * @param {unknown} tie - Existing row
 * @return {void}
 */

export const refuseTwice = (tie: unknown): void => {
  if (tie) throw conflict(PLAY_FRIENDS_ERRORS.already)
}

/**
 * Accepted friends of a player
 * @param {string} accountId - Player
 * @return {Promise<Set<string>>} - Friend ids
 */

export const listFriendIds = async (accountId: string): Promise<Set<string>> => {
  const rows = await prisma.playFriendship.findMany({
    where: {
      acceptedAt: { not: null },
      OR: [{ requesterId: accountId }, { addresseeId: accountId }],
    },
    select: { requesterId: true, addresseeId: true },
  })

  return new Set(
    rows.map((row) => (row.requesterId === accountId ? row.addresseeId : row.requesterId))
  )
}
