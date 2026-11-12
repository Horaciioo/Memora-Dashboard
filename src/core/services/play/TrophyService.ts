import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { levelOf } from '@/core/lib/play'
import { PLAY_TROPHIES, trophiesOf } from '@/declarations/play'

/**
 * Pay the trophies newly reached, each worth the whole level it completes
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string[]} accountIds - Players to check
 * @param {boolean} [backfill] - Trophies reached before they paid
 * @return {Promise<void>} - Written
 */

export const awardTrophies = async (
  tx: Prisma.TransactionClient,
  accountIds: string[],
  backfill = false
): Promise<void> => {
  for (const accountId of new Set(accountIds)) {
    const [stats, profile, wins] = await Promise.all([
      tx.playGameStat.findMany({ where: { accountId } }),
      tx.playProfile.findUnique({ where: { accountId } }),
      tx.playTrophyWin.findMany({ where: { accountId } }),
    ])
    const won = new Set(wins.map((win) => win.trophy))
    const sum = (field: 'played' | 'wins' | 'draws' | 'losses') =>
      stats.reduce((total, stat) => total + stat[field], 0)
    const global = {
      played: sum('played'),
      wins: sum('wins'),
      draws: sum('draws'),
      losses: sum('losses'),
      bestStreak: Math.max(0, ...stats.map((stat) => stat.bestStreak)),
      tournamentsPlayed: stats.reduce((total, stat) => total + stat.tournamentsPlayed, 0),
      tournamentsWon: stats.reduce((total, stat) => total + stat.tournamentsWon, 0),
      playSeconds: stats.reduce((total, stat) => total + stat.playSeconds, 0),
    }
    const reached = new Set(
      trophiesOf(global)
        .filter((trophy) => trophy.reached)
        .map((trophy) => trophy.key)
    )
    // Running XP, so a second trophy pays on the level the first one opened
    let xp =
      stats.reduce((total, stat) => total + stat.xp, 0) +
      (profile?.bonusXp ?? 0) +
      wins.reduce((total, win) => total + win.xp, 0)

    for (const trophy of PLAY_TROPHIES) {
      if (!reached.has(trophy.key) || won.has(trophy.key)) continue

      // Whole bar of the current level, whatever is already filled
      const paid = levelOf(Math.max(0, xp)).needed ?? 0

      await tx.playTrophyWin.create({ data: { accountId, trophy: trophy.key, xp: paid, backfill } })
      xp += paid
    }
  }
}

/**
 * Pay once the trophies a player had won before they paid
 * @param {string} accountId - Player
 * @return {Promise<void>} - Paid
 */

export const claimTrophies = async (accountId: string): Promise<void> => {
  const profile = await prisma.playProfile.findUnique({
    where: { accountId },
    select: { trophiesClaimedAt: true },
  })
  if (profile?.trophiesClaimedAt) return

  await prisma.$transaction(async (tx) => {
    await awardTrophies(tx, [accountId], true)
    const paid = await tx.playTrophyWin.count({ where: { accountId, backfill: true } })
    const data = { trophiesClaimedAt: new Date(), trophyNotice: paid > 0 }

    await tx.playProfile.upsert({
      where: { accountId },
      create: { accountId, ...data },
      update: data,
    })
  })
}

/**
 * Sum of the back payment, null once read
 * @typedef {Object} TrophyNotice
 * @property {number} trophies - Trophies paid
 * @property {number} xp - XP given
 * @property {number} levels - Levels climbed
 */

export interface TrophyNotice {
  trophies: number
  xp: number
  levels: number
}

/**
 * Back payment to announce to a player
 * @param {string} accountId - Player
 * @return {Promise<TrophyNotice | null>} - Sum or nothing
 */

export const readTrophyNotice = async (accountId: string): Promise<TrophyNotice | null> => {
  const profile = await prisma.playProfile.findUnique({
    where: { accountId },
    select: { trophyNotice: true, bonusXp: true },
  })
  if (!profile?.trophyNotice) return null

  const [stats, wins, back] = await Promise.all([
    prisma.playGameStat.aggregate({ where: { accountId }, _sum: { xp: true } }),
    prisma.playTrophyWin.aggregate({ where: { accountId }, _sum: { xp: true } }),
    prisma.playTrophyWin.aggregate({
      where: { accountId, backfill: true },
      _count: true,
      _sum: { xp: true },
    }),
  ])
  const xp = back._sum.xp ?? 0
  const total = (stats._sum.xp ?? 0) + profile.bonusXp + (wins._sum.xp ?? 0)

  return {
    trophies: back._count,
    xp,
    levels: levelOf(total).level - levelOf(Math.max(0, total - xp)).level,
  }
}

/**
 * Mark the back payment as read
 * @param {string} accountId - Player
 * @return {Promise<void>} - Written
 */

export const dismissTrophyNotice = async (accountId: string): Promise<void> => {
  await prisma.playProfile.updateMany({ where: { accountId }, data: { trophyNotice: false } })
}
