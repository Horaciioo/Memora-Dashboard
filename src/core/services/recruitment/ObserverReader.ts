import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Whether a member observes a session
 * @param {string} sessionId - Session identifier
 * @param {string} accountId - Member
 * @return {Promise<boolean>} - Holds an observer seat
 */

export const isObserver = async (sessionId: string, accountId: string): Promise<boolean> =>
  (await prisma.recruitmentObserver.count({ where: { sessionId, accountId } })) > 0
