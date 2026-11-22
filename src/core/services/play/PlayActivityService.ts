import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { levelOf } from '@/core/lib/play/levels'
import type { PlayActivityView } from '@/types/play'

// Lines the bell keeps in view
const ACTIVITY_SIZE = 30

/**
 * Global XP of a player, every line counted
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string} accountId - Player
 * @return {Promise<number>} - Total XP
 */

const totalXpOf = async (tx: Prisma.TransactionClient, accountId: string): Promise<number> => {
  const [stats, wins, profile] = await Promise.all([
    tx.playGameStat.aggregate({ where: { accountId }, _sum: { xp: true } }),
    tx.playTrophyWin.aggregate({ where: { accountId }, _sum: { xp: true } }),
    tx.playProfile.findUnique({ where: { accountId }, select: { bonusXp: true } }),
  ])

  return Math.max(0, (stats._sum.xp ?? 0) + (wins._sum.xp ?? 0) + (profile?.bonusXp ?? 0))
}

/**
 * Note XP just paid, and the level it opened if any
 * @param {Prisma.TransactionClient} tx - Transaction, the XP already written
 * @param {string} accountId - Player
 * @param {Object} gain - What was paid
 * @param {'XP' | 'QUEST' | 'TROPHY'} gain.kind - Source
 * @param {number} gain.xp - XP paid
 * @param {string} [gain.ref] - Game, quest slot or trophy
 * @return {Promise<void>} - Written
 */

export const noteGain = async (
  tx: Prisma.TransactionClient,
  accountId: string,
  gain: { kind: 'XP' | 'QUEST' | 'TROPHY'; xp: number; ref?: string }
): Promise<void> => {
  if (gain.xp <= 0) return

  const after = await totalXpOf(tx, accountId)
  const before = levelOf(after - gain.xp).level
  const reached = levelOf(after).level
  const at = Date.now()

  await tx.playActivity.create({ data: { accountId, ...gain } })
  // One tick later, so the level reads above the gain
  if (reached > before)
    await tx.playActivity.create({
      data: { accountId, kind: 'LEVEL', level: reached, createdAt: new Date(at + 1) },
    })
}

/**
 * Latest lines of a player with the unread count
 * @param {string} accountId - Player
 * @return {Promise<{ entries: PlayActivityView[]; unread: number }>} - Bell content
 */

export const readPlayActivities = async (
  accountId: string
): Promise<{ entries: PlayActivityView[]; unread: number }> => {
  const [rows, unread] = await Promise.all([
    prisma.playActivity.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: ACTIVITY_SIZE,
    }),
    prisma.playActivity.count({ where: { accountId, readAt: null } }),
  ])

  return {
    unread,
    entries: rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      xp: row.xp,
      level: row.level,
      ref: row.ref,
      createdAt: row.createdAt.toISOString(),
      isRead: Boolean(row.readAt),
    })),
  }
}

/**
 * Mark every line as read
 * @param {string} accountId - Player
 * @return {Promise<void>} - Written
 */

export const markPlayActivitiesRead = async (accountId: string): Promise<void> => {
  await prisma.playActivity.updateMany({
    where: { accountId, readAt: null },
    data: { readAt: new Date() },
  })
}
