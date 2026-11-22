import 'server-only'

import { prisma } from '@/core/lib/db'
import { levelOf } from '@/core/lib/play'

/**
 * Standing shown once after the level ladder change
 * @typedef {Object} LevelNotice
 * @property {number} levels - Levels gained
 * @property {number} xp - XP gained
 * @property {number} factor - XP multiplier per game
 */

export interface LevelNotice {
  levels: number
  xp: number
  factor: number
}

// XP multiplier of the change
const LEVEL_FACTOR = 5

/**
 * Ladder change to announce to a player
 * @param {string} accountId - Player
 * @return {Promise<LevelNotice | null>} - Standing or nothing
 */

export const readLevelNotice = async (accountId: string): Promise<LevelNotice | null> => {
  const profile = await prisma.playProfile.findUnique({
    where: { accountId },
    select: { levelNotice: true, bonusXp: true },
  })
  if (!profile?.levelNotice) return null

  const [stats, wins] = await Promise.all([
    prisma.playGameStat.aggregate({ where: { accountId }, _sum: { xp: true } }),
    prisma.playTrophyWin.aggregate({ where: { accountId }, _sum: { xp: true } }),
  ])
  const games = stats._sum.xp ?? 0
  const rest = profile.bonusXp + (wins._sum.xp ?? 0)
  const after = Math.max(0, games + rest)
  const before = Math.max(0, games / LEVEL_FACTOR + rest)

  return {
    levels: levelOf(after).level - levelOf(before).level,
    xp: Math.round(after - before),
    factor: LEVEL_FACTOR,
  }
}

/**
 * Mark the ladder change as read
 * @param {string} accountId - Player
 * @return {Promise<void>} - Written
 */

export const dismissLevelNotice = async (accountId: string): Promise<void> => {
  await prisma.playProfile.updateMany({ where: { accountId }, data: { levelNotice: false } })
}
