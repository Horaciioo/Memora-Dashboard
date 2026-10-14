import 'server-only'

import { prisma } from '@/core/lib/db'
import type { ObserverView } from '@/types/recruitment'

/**
 * Observers of a session
 * @param {string} sessionId - Session identifier
 * @return {Promise<ObserverView[]>} - Observers with their usage
 */

export const readObservers = async (sessionId: string): Promise<ObserverView[]> => {
  const rows = await prisma.recruitmentObserver.findMany({
    where: { sessionId },
    include: { account: true },
    orderBy: { createdAt: 'asc' },
  })

  // Interviews each one already joined
  const seats = await prisma.recruitmentSeat.groupBy({
    by: ['accountId'],
    where: { accountId: { in: rows.map((row) => row.accountId) }, candidate: { sessionId } },
    _count: { _all: true },
  })

  const used = new Map(seats.map((seat) => [seat.accountId, seat._count._all]))

  return rows.map((row) => ({
    id: row.id,
    person: {
      id: row.accountId,
      label: row.account.displayName,
      accent: null,
      image: row.account.avatarUrl,
    },
    quota: row.quota,
    used: used.get(row.accountId) ?? 0,
  }))
}

/**
 * Whether a member observes a session
 * @param {string} sessionId - Session identifier
 * @param {string} accountId - Member
 * @return {Promise<boolean>} - Holds an observer seat
 */

export const isObserver = async (sessionId: string, accountId: string): Promise<boolean> =>
  (await prisma.recruitmentObserver.count({ where: { sessionId, accountId } })) > 0
