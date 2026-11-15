import 'server-only'

import { prisma } from '@/core/lib/db'
import { StopGoMoveKinds } from '@/utils/constants/play'

// Counters of one player
const EMPTY = {
  km: 0,
  attacks: 0,
  suffered: 0,
  remedies: 0,
  immunities: 0,
  cleanups: 0,
  revealed: 0,
}

/**
 * Game counters per player, read from the public log
 * @param {string} sessionId - Game
 * @return {Promise<Map<string, Record<string, number>>>} - Counters
 */

export const stopGoStats = async (
  sessionId: string
): Promise<Map<string, Record<string, number>>> => {
  const moves = await prisma.stopGoMove.findMany({
    where: { sessionId },
    select: { accountId: true, kind: true, targetIds: true, km: true },
  })
  const stats = new Map<string, Record<string, number>>()
  const entryOf = (accountId: string) => {
    const entry = stats.get(accountId) ?? { ...EMPTY }
    stats.set(accountId, entry)

    return entry
  }

  for (const { accountId, kind, targetIds, km } of moves) {
    const entry = entryOf(accountId)
    if (kind === StopGoMoveKinds.Distance) entry.km += km ?? 0
    if (kind === StopGoMoveKinds.Remedy || kind === StopGoMoveKinds.Green) entry.remedies += 1
    if (kind === StopGoMoveKinds.Immunity) entry.immunities += 1
    if (kind === StopGoMoveKinds.Cleanup) entry.cleanups += 1
    if (kind === StopGoMoveKinds.Reveal) entry.revealed += 1
    if (kind === StopGoMoveKinds.Attack) {
      entry.attacks += 1
      for (const targetId of targetIds) entryOf(targetId).suffered += 1
    }
  }
  // A saved attack never landed
  for (const { accountId, kind } of moves) {
    if (kind === StopGoMoveKinds.Immunity) entryOf(accountId).suffered -= 1
  }

  return stats
}
