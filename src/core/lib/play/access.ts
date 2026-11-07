import type { Prisma, PrismaClient } from '@prisma/client'

import { PlayVisibilities } from '@/utils/constants/play'

/**
 * Whether a member may open a game
 * @param {PrismaClient | Prisma.TransactionClient} client - Database client
 * @param {{ id: string, visibility: string, seats: { accountId: string }[] }} session - Game
 * @param {string} accountId - Member
 * @return {Promise<boolean>} - Allowed
 */

export const mayEnter = async (
  client: PrismaClient | Prisma.TransactionClient,
  session: { id: string; visibility: string; seats: { accountId: string }[] },
  accountId: string
): Promise<boolean> => {
  if (session.visibility !== PlayVisibilities.Private) return true
  if (session.seats.some((seat) => seat.accountId === accountId)) return true

  // Called by name, or by all of Memora
  const invite = await client.playInvite.findFirst({
    where: { sessionId: session.id, OR: [{ inviteeId: accountId }, { inviteeId: null }] },
    select: { id: true },
  })

  return Boolean(invite)
}
