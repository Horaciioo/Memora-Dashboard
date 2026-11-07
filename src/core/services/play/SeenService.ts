import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Remember a member just left Play
 * @param {string} accountId - Member
 * @return {Promise<void>}
 */

export const touchPlaySeen = async (accountId: string): Promise<void> => {
  const now = new Date()

  await prisma.playProfile.upsert({
    where: { accountId },
    create: { accountId, lastSeenAt: now },
    update: { lastSeenAt: now },
  })
}
