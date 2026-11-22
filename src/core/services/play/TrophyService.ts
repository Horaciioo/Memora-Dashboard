import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { levelOf, readBodyList, trophiesOf } from '@/core/lib/play'
import { noteGain } from '@/core/services/play/PlayActivityService'
import {
  PLAY_CELEBRATION,
  PLAY_PIN_MAX,
  PLAY_RARITY_LEVELS,
  PLAY_TROPHIES,
} from '@/declarations/play'
import type { PlayTrophy } from '@/declarations/play/trophies'

/**
 * Pay the trophies newly reached, each worth as many whole levels as its rarity
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
    const reached = new Set(
      trophiesOf(stats)
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

      // Whole bar of each level crossed, whatever is already filled
      let paid = 0
      for (let step = 0; step < PLAY_RARITY_LEVELS[trophy.rarity]; step++)
        paid += levelOf(Math.max(0, xp + paid)).needed ?? 0

      await tx.playTrophyWin.create({
        data: { accountId, trophy: trophy.key, xp: paid, backfill, seen: backfill },
      })
      if (!backfill) await noteGain(tx, accountId, { kind: 'TROPHY', xp: paid, ref: trophy.key })
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

/**
 * Share of players who won each trophy, in percent
 * @return {Promise<Record<string, number>>} - Percent per trophy key
 */

export const readTrophyRarity = async (): Promise<Record<string, number>> => {
  const [players, wins] = await Promise.all([
    prisma.playGameStat.groupBy({ by: ['accountId'] }).then((rows) => rows.length),
    prisma.playTrophyWin.groupBy({ by: ['trophy'], _count: { _all: true } }),
  ])
  const owners = new Map(wins.map((row) => [row.trophy, row._count._all]))

  return Object.fromEntries(
    PLAY_TROPHIES.map((trophy) => [
      trophy.key,
      players ? Math.min(100, Math.round(((owners.get(trophy.key) ?? 0) / players) * 100)) : 0,
    ])
  )
}

/**
 * Showcase of a player: won trophies only, in the order given
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the trophy keys
 * @return {Promise<void>} - Saved
 */

export const setPinnedTrophies = async (
  accountId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const asked = readBodyList(raw, 'pins') ?? []
  const won = new Set(
    (await prisma.playTrophyWin.findMany({ where: { accountId }, select: { trophy: true } })).map(
      (win) => win.trophy
    )
  )
  const pins = [...new Set(asked)].filter((key) => won.has(key)).slice(0, PLAY_PIN_MAX)

  await prisma.playProfile.upsert({
    where: { accountId },
    create: { accountId, pinnedTrophies: pins },
    update: { pinnedTrophies: pins },
  })
}

/**
 * Trophies won and not cheered yet, claimed once so no screen shows them twice
 * @param {string} accountId - Player
 * @return {Promise<PlayTrophy[]>} - Rarest first, capped to what one visit can show
 */

export const claimTrophyCheers = async (accountId: string): Promise<PlayTrophy[]> => {
  const unseen = await prisma.playTrophyWin.findMany({
    where: { accountId, seen: false },
    select: { trophy: true },
  })
  const claimed: PlayTrophy[] = []

  for (const { trophy } of unseen) {
    const { count } = await prisma.playTrophyWin.updateMany({
      where: { accountId, trophy, seen: false },
      data: { seen: true },
    })
    const found = PLAY_TROPHIES.find((entry) => entry.key === trophy)
    if (count > 0 && found) claimed.push(found)
  }

  return claimed
    .sort((left, right) => PLAY_RARITY_LEVELS[right.rarity] - PLAY_RARITY_LEVELS[left.rarity])
    .slice(0, PLAY_CELEBRATION.visitMax)
}
