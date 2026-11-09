import 'server-only'

import { prisma } from '@/core/lib/db'
import { engineOf } from '@/core/services/play/PlaySessionService'
import { PLAY_SETTINGS, pickHistoryFact } from '@/declarations/play'
import type { PlayHistoryPage } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

interface PlayHistoryQuery {
  game?: PlayGameName | null
  cursor?: string | null
  size?: number
}

/**
 * Games the player finished, newest first, one page at a time
 * @param {string} accountId - Player
 * @param {PlayHistoryQuery} [options] - Game filter, resume point and page size
 * @return {Promise<PlayHistoryPage>} - Page of history
 */

export const listPlayHistory = async (
  accountId: string,
  { game, cursor, size = PLAY_SETTINGS.historyPage }: PlayHistoryQuery = {}
): Promise<PlayHistoryPage> => {
  const rows = await prisma.playSeat.findMany({
    where: {
      accountId,
      session: { status: PlayStatuses.Finished, ...(game ? { game } : {}) },
    },
    orderBy: [{ session: { finishedAt: 'desc' } }, { id: 'desc' }],
    take: size + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      rank: true,
      outcome: true,
      xp: true,
      score: true,
      session: {
        select: {
          id: true,
          game: true,
          startedAt: true,
          finishedAt: true,
          seats: {
            orderBy: [{ rank: { sort: 'asc', nulls: 'last' } }, { score: 'desc' }],
            select: {
              accountId: true,
              rank: true,
              score: true,
              account: { select: { displayName: true, avatarUrl: true, botKind: true } },
            },
          },
        },
      },
    },
  })
  const page = rows.slice(0, size)
  const stats = await Promise.all(
    page.map(({ session }) => engineOf(session.game).extraStats(session.id))
  )

  return {
    nextCursor: rows.length > size ? page[page.length - 1].id : null,
    entries: page.map(({ rank, outcome, xp, score, session }, index) => ({
      sessionId: session.id,
      game: session.game,
      rank,
      outcome,
      xp,
      score,
      players: session.seats.length,
      finishedAt: (session.finishedAt ?? new Date()).toISOString(),
      durationSeconds:
        session.startedAt && session.finishedAt
          ? Math.max(
              0,
              Math.round((session.finishedAt.getTime() - session.startedAt.getTime()) / SECOND_MS)
            )
          : null,
      fact: pickHistoryFact(session.game, stats[index].get(accountId)),
      table: session.seats.map((seat) => ({
        accountId: seat.accountId,
        name: seat.account.displayName,
        avatarUrl: seat.account.avatarUrl,
        isBot: seat.account.botKind !== null,
        isMe: seat.accountId === accountId,
        rank: seat.rank,
        score: seat.score,
      })),
    })),
  }
}
