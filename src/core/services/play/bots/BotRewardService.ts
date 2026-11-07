import 'server-only'

import type { Prisma } from '@prisma/client'

import { PLAY_SETTINGS } from '@/declarations/play'

/**
 * Bots among some players
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string[]} accountIds - Players
 * @return {Promise<Set<string>>} - Bot ids
 */

export const botIdsAmong = async (
  tx: Prisma.TransactionClient,
  accountIds: string[]
): Promise<Set<string>> => {
  const bots = await tx.account.findMany({
    where: { id: { in: accountIds }, botKind: { not: null } },
    select: { id: true },
  })

  return new Set(bots.map((bot) => bot.id))
}

/**
 * Human results, XP cut beside a bot
 * @param {T[]} results - Ranked results
 * @param {Set<string>} botIds - Bots at the table
 * @return {T[]} - Results to pay
 */

export const humanResults = <T extends { accountId: string; xp: number }>(
  results: T[],
  botIds: Set<string>
): T[] =>
  results
    .filter((result) => !botIds.has(result.accountId))
    .map((result) =>
      botIds.size
        ? { ...result, xp: Math.round(result.xp * PLAY_SETTINGS.rewards.botXpRatio) }
        : result
    )
