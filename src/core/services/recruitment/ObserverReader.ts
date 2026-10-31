import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Whether a member observes a session, by a named seat or by an interview they sit in
 * @param {string} sessionId - Session identifier
 * @param {string} accountId - Member
 * @return {Promise<boolean>} - Holds an observer seat
 */

export const isObserver = async (sessionId: string, accountId: string): Promise<boolean> => {
  const [named, seated] = await Promise.all([
    prisma.recruitmentObserver.count({ where: { sessionId, accountId } }),
    prisma.recruitmentSeat.count({ where: { accountId, candidate: { sessionId } } }),
  ])

  return named + seated > 0
}
