import 'server-only'

import { prisma } from '@/core/lib/db'
import { listPlayHistory } from '@/core/services/play/HistoryService'
import { readPlayPresence } from '@/core/services/play/ProfileService'
import {
  fillPlayMessage,
  PLAY_GAMES,
  PLAY_HISTORY_FACTS,
  PLAY_PROFILE_COPY,
  PLAY_SETTINGS,
  PLAY_STROKE_GAMES,
} from '@/declarations/play'
import type { PlayRecordView, PlaySheetView } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Best score of a player at one game
 * @param {string} accountId - Player
 * @param {PlayGameName} game - Game
 * @return {Promise<PlayRecordView | null>} - Record, null without a finished game
 */

const bestScoreOf = async (
  accountId: string,
  game: PlayGameName
): Promise<PlayRecordView | null> => {
  const best = await prisma.playSeat.findFirst({
    where: { accountId, session: { game, status: PlayStatuses.Finished } },
    orderBy: { score: 'desc' },
    select: { score: true },
  })
  if (!best) return null
  const isStrokes = PLAY_STROKE_GAMES.includes(game)

  return {
    key: `best:${game}`,
    game,
    label: fillPlayMessage(PLAY_PROFILE_COPY.bestScoreGame, { game: PLAY_GAMES.label(game) }),
    value: fillPlayMessage(isStrokes ? PLAY_PROFILE_COPY.strokes : PLAY_PROFILE_COPY.points, {
      count: isStrokes ? -best.score : best.score,
    }),
  }
}

/**
 * Sheet of a player: most played games, records, last games, last visit
 * @param {string} accountId - Player
 * @return {Promise<PlaySheetView>} - Sheet
 */

export const readPlaySheet = async (accountId: string): Promise<PlaySheetView> => {
  const [stats, profile, recent, presence] = await Promise.all([
    prisma.playGameStat.findMany({ where: { accountId, played: { gt: 0 } } }),
    prisma.playProfile.findUnique({ where: { accountId }, select: { lastSeenAt: true } }),
    listPlayHistory(accountId, { size: PLAY_SETTINGS.profileRecent }),
    readPlayPresence(accountId),
  ])
  const played = stats.filter(
    (stat) => PLAY_GAMES.has(stat.game) && PLAY_GAMES.get(stat.game).playable
  )
  const bests = await Promise.all(played.map((stat) => bestScoreOf(accountId, stat.game)))
  const bestStreak = Math.max(0, ...stats.map((stat) => stat.bestStreak))

  // Series first, then best scores, then the counter each game boasts about
  const records: PlayRecordView[] = [
    ...(bestStreak > 0
      ? [
          {
            key: 'streak',
            game: null,
            label: PLAY_PROFILE_COPY.bestStreak,
            value: fillPlayMessage(PLAY_PROFILE_COPY.streakValue, { count: bestStreak }),
          },
        ]
      : []),
    ...bests.filter((record): record is PlayRecordView => record !== null),
    ...played.flatMap((stat) => {
      const fact = PLAY_HISTORY_FACTS[stat.game][0]
      const total = (stat.extra as Record<string, number>)[fact.key] ?? 0

      return total > 0
        ? [
            {
              key: `${fact.key}:${stat.game}`,
              game: stat.game,
              label: fillPlayMessage(PLAY_PROFILE_COPY.total, { label: fact.label }),
              value: String(total),
            },
          ]
        : []
    }),
  ]

  return {
    topGames: [...played]
      .sort((a, b) => b.played - a.played)
      .slice(0, PLAY_SETTINGS.profileTopGames)
      .map((stat) => ({ game: stat.game, played: stat.played })),
    records,
    recent: recent.entries,
    lastSeenAt: profile?.lastSeenAt?.toISOString() ?? null,
    presence,
  }
}
