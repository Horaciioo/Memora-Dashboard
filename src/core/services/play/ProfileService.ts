import 'server-only'

import { openSeatOf } from '@/core/lib/play/session'
import { prisma } from '@/core/lib/db'
import { levelOf } from '@/core/lib/play'
import {
  PLAY_GAMES,
  PLAY_LEADER_KEYS,
  PLAY_LEADER_METRICS,
  PLAY_SETTINGS,
} from '@/declarations/play'
import type { PlayLeaderMetric } from '@/declarations/play'
import type { PlayLeader, PlayPresence } from '@/types/play'
import type { Prisma } from '@prisma/client'
import type { PlayGameName } from '@/utils/constants/play'

// Counters summed into the global line
const TOTAL_FIELDS = [
  'xp',
  'played',
  'wins',
  'draws',
  'losses',
  'abandons',
  'playSeconds',
  'tournamentsPlayed',
  'tournamentsWon',
] as const

/**
 * Win share of some totals
 * @param {{ wins: number, played: number }} totals - Totals
 * @return {number} - Share between 0 and 1
 */

const winRate = ({ wins, played }: { wins: number; played: number }): number =>
  played ? wins / played : 0

/**
 * Play tab of a member
 * @param {string} accountId - Member
 * @return {Promise<object>} - Global and per game stats
 */

export const readPlayProfile = async (accountId: string) => {
  const [stats, profile] = await Promise.all([
    prisma.playGameStat.findMany({ where: { accountId } }),
    prisma.playProfile.findUnique({ where: { accountId } }),
  ])
  const byGame = new Map(stats.map((stat) => [stat.game, stat]))

  // Global line, sums and best streak
  const totals = Object.fromEntries(
    TOTAL_FIELDS.map((field) => [field, stats.reduce((sum, stat) => sum + stat[field], 0)])
  ) as Record<(typeof TOTAL_FIELDS)[number], number>
  // Global XP also holds its own bonus
  const bonusXp = profile?.bonusXp ?? 0
  totals.xp = Math.max(0, totals.xp + bonusXp)

  return {
    global: {
      ...totals,
      bestStreak: Math.max(0, ...stats.map((stat) => stat.bestStreak)),
      winRate: winRate(totals),
      level: levelOf(totals.xp),
      bonusXp,
    },
    ban: profile?.bannedAt
      ? { since: profile.bannedAt.toISOString(), reason: profile.banReason }
      : null,
    games: PLAY_GAMES.keys.map((game) => {
      const stat = byGame.get(game)

      return {
        game,
        xp: stat?.xp ?? 0,
        level: levelOf(stat?.xp ?? 0),
        played: stat?.played ?? 0,
        wins: stat?.wins ?? 0,
        draws: stat?.draws ?? 0,
        losses: stat?.losses ?? 0,
        abandons: stat?.abandons ?? 0,
        streak: stat?.streak ?? 0,
        bestStreak: stat?.bestStreak ?? 0,
        playSeconds: stat?.playSeconds ?? 0,
        tournamentsPlayed: stat?.tournamentsPlayed ?? 0,
        tournamentsWon: stat?.tournamentsWon ?? 0,
        winRate: winRate({ wins: stat?.wins ?? 0, played: stat?.played ?? 0 }),
        extra: stat?.extra ?? {},
      }
    }),
    maxLevel: PLAY_SETTINGS.levels.max,
  }
}

/**
 * Best players of one game by one measure
 * @param {PlayGameName} game - Game
 * @param {PlayLeaderMetric} metric - Ranking measure
 * @return {Promise<PlayLeader[]>} - Leaders
 */

const leadersBy = async (game: PlayGameName, metric: PlayLeaderMetric): Promise<PlayLeader[]> => {
  const leaders = await prisma.playGameStat.findMany({
    where: { game, played: { gt: 0 } },
    orderBy: PLAY_LEADER_METRICS[metric].sort.map((field) => ({ [field]: 'desc' as const })),
    take: PLAY_SETTINGS.leaderboardSize,
    include: { account: { select: { displayName: true, avatarUrl: true } } },
  })

  return leaders.map((entry, index) => ({
    rank: index + 1,
    accountId: entry.accountId,
    name: entry.account.displayName,
    avatarUrl: entry.account.avatarUrl,
    xp: entry.xp,
    level: levelOf(entry.xp).level,
    wins: entry.wins,
    played: entry.played,
  }))
}

/**
 * Best players of one game, one list per measure
 * @param {PlayGameName} game - Game
 * @return {Promise<Record<PlayLeaderMetric, PlayLeader[]>>} - Leaders
 */

export const readLeaderboards = async (
  game: PlayGameName
): Promise<Record<PlayLeaderMetric, PlayLeader[]>> => {
  const lists = await Promise.all(PLAY_LEADER_KEYS.map((metric) => leadersBy(game, metric)))

  return Object.fromEntries(
    PLAY_LEADER_KEYS.map((metric, index) => [metric, lists[index]])
  ) as Record<PlayLeaderMetric, PlayLeader[]>
}

/**
 * Latest game a member sits in right now
 * @param {string} accountId - Member
 * @param {PlayGameName} [game] - Only this game
 * @return {Promise<PlayPresence | null>} - Game and its stage
 */

export const readPlayPresence = async (
  accountId: string,
  game?: PlayGameName
): Promise<PlayPresence | null> => {
  const seat = await prisma.playSeat.findFirst({
    where: openSeatOf(accountId, game),
    orderBy: { session: { updatedAt: 'desc' } },
    select: { session: { select: { id: true, game: true, status: true } } },
  })

  return (
    seat && { sessionId: seat.session.id, game: seat.session.game, status: seat.session.status }
  )
}

/**
 * Whether a member is kept out of Play
 * @param {string} accountId - Member
 * @param {Prisma.TransactionClient} [client] - Transaction
 * @return {Promise<boolean>} - Banned
 */

export const isPlayBanned = async (
  accountId: string,
  client: Prisma.TransactionClient = prisma
): Promise<boolean> =>
  Boolean(
    (await client.playProfile.findUnique({ where: { accountId }, select: { bannedAt: true } }))
      ?.bannedAt
  )

/**
 * Another player's name and stats
 * @param {string} accountId - Player
 * @return {Promise<object | null>} - Player and profile, null when gone
 */

export const readPlayPlayer = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { displayName: true, avatarUrl: true, anonymisedAt: true },
  })
  if (!account || account.anonymisedAt) return null

  return {
    player: { name: account.displayName, avatarUrl: account.avatarUrl },
    profile: await readPlayProfile(accountId),
  }
}
