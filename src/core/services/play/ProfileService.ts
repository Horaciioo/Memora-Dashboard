import 'server-only'

import { openSeatOf } from '@/core/lib/play/session'
import { prisma } from '@/core/lib/db'
import { levelOf } from '@/core/lib/play'
import { PLAY_GAMES, PLAY_SETTINGS } from '@/declarations/play'
import type { PlayPresence } from '@/types/play'
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
  const stats = await prisma.playGameStat.findMany({ where: { accountId } })
  const byGame = new Map(stats.map((stat) => [stat.game, stat]))

  // Global line, sums and best streak
  const totals = Object.fromEntries(
    TOTAL_FIELDS.map((field) => [field, stats.reduce((sum, stat) => sum + stat[field], 0)])
  ) as Record<(typeof TOTAL_FIELDS)[number], number>

  return {
    global: {
      ...totals,
      bestStreak: Math.max(0, ...stats.map((stat) => stat.bestStreak)),
      winRate: winRate(totals),
      level: levelOf(totals.xp),
    },
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
 * Best players of one game
 * @param {PlayGameName} game - Game
 * @return {Promise<object[]>} - Leaders
 */

export const readLeaderboard = async (game: PlayGameName) => {
  const leaders = await prisma.playGameStat.findMany({
    where: { game, played: { gt: 0 } },
    orderBy: [{ xp: 'desc' }, { wins: 'desc' }],
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
 * Game a member sits in right now
 * @param {string} accountId - Member
 * @return {Promise<PlayPresence | null>} - Game and its stage
 */

export const readPlayPresence = async (accountId: string): Promise<PlayPresence | null> => {
  const seat = await prisma.playSeat.findFirst({
    where: openSeatOf(accountId),
    select: { session: { select: { id: true, game: true, status: true } } },
  })

  return (
    seat && { sessionId: seat.session.id, game: seat.session.game, status: seat.session.status }
  )
}
