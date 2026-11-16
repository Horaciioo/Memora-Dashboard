import 'server-only'

import { endStatsOf } from '@/core/lib/play/endStats'
import type { LoadedSession } from '@/core/lib/play/session'
import { engineOf } from '@/core/services/play/PlaySessionService'
import { readPlayProfile } from '@/core/services/play/ProfileService'
import { PLAY_END_LIMITS } from '@/declarations/play/end'
import { PLAY_HISTORY_FACTS } from '@/declarations/play/history'
import type { PlayEndAward, PlayEndReport } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'

/**
 * Titles of a finished game: for each counter of the game, whoever led the table
 * @param {LoadedSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<PlayEndAward[]>} - Titles, the game's best counters first
 */

const awardsOf = async (session: LoadedSession, viewerId: string): Promise<PlayEndAward[]> => {
  const counters = await engineOf(session.game).extraStats(session.id)

  return PLAY_HISTORY_FACTS[session.game].flatMap(({ key, label }) => {
    const leader = session.seats
      .filter((seat) => !seat.kickedAt)
      .map((seat) => ({ seat, value: counters.get(seat.accountId)?.[key] ?? 0 }))
      .reduce<{ seat: LoadedSession['seats'][number]; value: number } | null>(
        (best, entry) => (entry.value > (best?.value ?? 0) ? entry : best),
        null
      )

    return leader
      ? [
          {
            key,
            label,
            value: leader.value,
            accountId: leader.seat.accountId,
            name: leader.seat.account.displayName,
            avatarUrl: leader.seat.account.avatarUrl,
            isMe: leader.seat.accountId === viewerId,
          },
        ]
      : []
  })
}

/**
 * Report of a finished game as one of its players reads it
 * @param {LoadedSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<PlayEndReport | null>} - Report, null while the game runs
 */

export const readEndReport = async (
  session: LoadedSession,
  viewerId: string
): Promise<PlayEndReport | null> => {
  if (session.status !== PlayStatuses.Finished) return null
  const seats = session.seats.filter((seat) => !seat.kickedAt)
  const { stats, place } = endStatsOf(
    {
      seats: seats.map((seat) => ({ ...seat, botKind: seat.account.botKind })),
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
    },
    viewerId
  )
  const winner = seats.find((seat) => seat.rank === 1)
  const isHuman = seats.some((seat) => seat.accountId === viewerId && !seat.account.botKind)
  const [awards, profile] = await Promise.all([
    awardsOf(session, viewerId),
    isHuman ? readPlayProfile(viewerId) : null,
  ])
  const career = profile?.games.find((entry) => entry.game === session.game)

  return {
    place,
    winner: winner
      ? {
          accountId: winner.accountId,
          name: winner.account.displayName,
          avatarUrl: winner.account.avatarUrl,
        }
      : null,
    stats,
    awards: awards.slice(0, PLAY_END_LIMITS.awards),
    career: career
      ? {
          played: career.played,
          wins: career.wins,
          winRate: career.winRate,
          streak: career.streak,
          bestStreak: career.bestStreak,
        }
      : null,
  }
}
