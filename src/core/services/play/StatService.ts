import 'server-only'

import type { Prisma } from '@prisma/client'

import { PlayOutcomes } from '@/utils/constants/play'
import type { PlayGameName, PlayOutcomeName } from '@/utils/constants/play'

/**
 * One result to add to a player's totals
 * @typedef {Object} StatEntry
 * @property {string} accountId - Player
 * @property {PlayOutcomeName | null} outcome - Null for a game left or a tournament
 * @property {boolean} [abandoned] - Left before the end
 * @property {number} xp - XP earned
 * @property {number} seconds - Time played
 * @property {Record<string, number>} [extra] - Game counters
 * @property {{ won: boolean }} [tournament] - Tournament closed
 */

export interface StatEntry {
  accountId: string
  outcome: PlayOutcomeName | null
  abandoned?: boolean
  xp: number
  seconds: number
  extra?: Record<string, number>
  tournament?: { won: boolean }
}

// Outcome counter per result
const OUTCOME_FIELD: Record<PlayOutcomeName, 'wins' | 'draws' | 'losses'> = {
  [PlayOutcomes.Win]: 'wins',
  [PlayOutcomes.Draw]: 'draws',
  [PlayOutcomes.Loss]: 'losses',
}

/**
 * Sum two counter maps
 * @param {Prisma.JsonValue} stored - Stored counters
 * @param {Record<string, number>} added - New counters
 * @return {Record<string, number>} - Sum
 */

const mergeExtra = (
  stored: Prisma.JsonValue,
  added: Record<string, number> = {}
): Record<string, number> => {
  const base = (stored ?? {}) as Record<string, number>

  return Object.fromEntries(
    [...new Set([...Object.keys(base), ...Object.keys(added)])].map((key) => [
      key,
      (base[key] ?? 0) + (added[key] ?? 0),
    ])
  )
}

/**
 * Add results to the players' totals
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {PlayGameName} game - Game
 * @param {StatEntry[]} entries - Results
 * @return {Promise<void>} - Written
 */

export const recordResults = async (
  tx: Prisma.TransactionClient,
  game: PlayGameName,
  entries: StatEntry[]
): Promise<void> => {
  const stored = await tx.playGameStat.findMany({
    where: { game, accountId: { in: entries.map((entry) => entry.accountId) } },
  })
  const byAccount = new Map(stored.map((stat) => [stat.accountId, stat]))

  for (const entry of entries) {
    const stat = byAccount.get(entry.accountId)
    const isGame = Boolean(entry.outcome) || Boolean(entry.abandoned)

    // A win extends the streak, anything else breaks it
    const streak = !isGame
      ? (stat?.streak ?? 0)
      : entry.outcome === PlayOutcomes.Win
        ? (stat?.streak ?? 0) + 1
        : 0
    const counters = {
      xp: (stat?.xp ?? 0) + entry.xp,
      played: (stat?.played ?? 0) + Number(isGame),
      abandons: (stat?.abandons ?? 0) + Number(Boolean(entry.abandoned)),
      streak,
      bestStreak: Math.max(stat?.bestStreak ?? 0, streak),
      playSeconds: (stat?.playSeconds ?? 0) + entry.seconds,
      tournamentsPlayed: (stat?.tournamentsPlayed ?? 0) + Number(Boolean(entry.tournament)),
      tournamentsWon: (stat?.tournamentsWon ?? 0) + Number(Boolean(entry.tournament?.won)),
      extra: mergeExtra(stat?.extra ?? {}, entry.extra),
      ...(entry.outcome && {
        [OUTCOME_FIELD[entry.outcome]]: (stat?.[OUTCOME_FIELD[entry.outcome]] ?? 0) + 1,
      }),
    }

    await tx.playGameStat.upsert({
      where: { accountId_game: { accountId: entry.accountId, game } },
      create: { accountId: entry.accountId, game, ...counters },
      update: counters,
    })
  }
}
