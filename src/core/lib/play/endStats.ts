import { fillPlayMessage } from '@/declarations/play/copy'
import { PLAY_END_COPY } from '@/declarations/play/end'
import type { PlayEndStat } from '@/types/play'
import { MINUTE_SECONDS } from '@/utils/constants/time'

/**
 * Figures of the page and the place of its reader
 * @typedef {Object} PlayEndSummary
 */

export interface PlayEndSummary {
  stats: PlayEndStat[]
  place: { rank: number; total: number } | null
}

interface EndSeat {
  accountId: string
  score: number
  rank: number | null
  xp: number
  botKind: unknown
}

/**
 * Figures a finished game tells about its table
 * @param {Object} game - Finished game
 * @param {EndSeat[]} game.seats - Seats of the game
 * @param {Date | null} game.startedAt - Start
 * @param {Date | null} game.finishedAt - End
 * @param {string} viewerId - Reader
 * @return {PlayEndSummary} - Figures worth showing
 */

export const endStatsOf = (
  game: { seats: EndSeat[]; startedAt: Date | null; finishedAt: Date | null },
  viewerId: string
): PlayEndSummary => {
  const stats: PlayEndStat[] = []
  const add = (key: keyof typeof PLAY_END_COPY, value: string) =>
    stats.push({ key, label: PLAY_END_COPY[key], value })
  const seats = game.seats.toSorted((left, right) => (left.rank ?? 99) - (right.rank ?? 99))
  const bots = seats.filter((seat) => seat.botKind).length
  const mine = seats.find((seat) => seat.accountId === viewerId)

  if (game.startedAt && game.finishedAt) {
    const seconds = Math.max(
      0,
      Math.round((new Date(game.finishedAt).getTime() - new Date(game.startedAt).getTime()) / 1000)
    )
    add(
      'duration',
      fillPlayMessage(PLAY_END_COPY.clock, {
        minutes: Math.floor(seconds / MINUTE_SECONDS),
        seconds: String(seconds % MINUTE_SECONDS).padStart(2, '0'),
      })
    )
  }
  add('players', String(seats.length - bots))
  if (bots) add('bots', String(bots))
  const [first, second] = seats
  if ((first?.score ?? 0) > 0) add('top', String(first.score))
  if ((first?.score ?? 0) > 0 && (second?.score ?? 0) > 0) {
    add('margin', String(first.score - second.score))
  }
  const xp = seats.reduce((sum, seat) => sum + seat.xp, 0)
  if (xp > 0) add('xpTable', fillPlayMessage(PLAY_END_COPY.xpValue, { xp }))

  return { stats, place: mine?.rank ? { rank: mine.rank, total: seats.length } : null }
}
