import 'server-only'

import { prisma } from '@/core/lib/db'
import { PLAY_GAMES } from '@/declarations/play'
import type { PlayAdminDay, PlayAdminLeader, PlayAdminStats } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'
import { DAY_MS } from '@/utils/constants/time'

// Days drawn by the charts
const SERIES_DAYS = 30
// Rows read at most, the charts need no more
const SEAT_LIMIT = 30000
const SESSION_LIMIT = 10000
// Players listed in the weekly ranking
const LEADERS = 5
const MINUTE_MS = 60000

/**
 * Local day of a date, YYYY-MM-DD
 * @param {Date} date - Moment
 * @return {string} - Day key
 */

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/**
 * Figures of Play: tables now, games finished, players of the week, thirty days of series
 * @return {Promise<PlayAdminStats>} - Stats
 */

export const readPlayAdminStats = async (): Promise<PlayAdminStats> => {
  const now = Date.now()
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0))
  const weekAgo = new Date(now - 7 * DAY_MS)
  const since = new Date(startOfDay.getTime() - (SERIES_DAYS - 1) * DAY_MS)
  const finished = { status: PlayStatuses.Finished }

  const [lobby, running, finishedToday, finishedWeek, byGame, byGameWeek, sessions, seats] =
    await Promise.all([
      prisma.playSession.count({ where: { status: PlayStatuses.Lobby } }),
      prisma.playSession.count({ where: { status: PlayStatuses.Running } }),
      prisma.playSession.count({ where: { ...finished, finishedAt: { gte: startOfDay } } }),
      prisma.playSession.count({ where: { ...finished, finishedAt: { gte: weekAgo } } }),
      prisma.playSession.groupBy({ by: ['game'], where: finished, _count: { _all: true } }),
      prisma.playSession.groupBy({
        by: ['game'],
        where: { ...finished, finishedAt: { gte: weekAgo } },
        _count: { _all: true },
      }),
      prisma.playSession.findMany({
        where: { ...finished, finishedAt: { gte: since } },
        select: { game: true, startedAt: true, finishedAt: true },
        take: SESSION_LIMIT,
      }),
      prisma.playSeat.findMany({
        where: {
          account: { botKind: null },
          session: { ...finished, finishedAt: { gte: since } },
        },
        select: {
          accountId: true,
          xp: true,
          account: { select: { displayName: true, avatarUrl: true } },
          session: { select: { finishedAt: true } },
        },
        take: SEAT_LIMIT,
      }),
    ])
  const total = new Map(byGame.map((row) => [row.game, row._count._all]))
  const week = new Map(byGameWeek.map((row) => [row.game, row._count._all]))

  // One bucket per day, empty ones kept so the charts have no hole
  const days = new Map<string, PlayAdminDay & { who: Set<string> }>()

  for (let index = 0; index < SERIES_DAYS; index += 1) {
    const date = dayKey(new Date(since.getTime() + index * DAY_MS))
    days.set(date, { date, finished: 0, players: 0, xp: 0, minutes: 0, byGame: {}, who: new Set() })
  }

  const hours = Array.from({ length: 24 }, () => 0)

  for (const session of sessions) {
    if (!session.finishedAt) continue

    const day = days.get(dayKey(session.finishedAt))
    hours[session.finishedAt.getHours()] += 1
    if (!day) continue

    day.finished += 1
    day.byGame[session.game] = (day.byGame[session.game] ?? 0) + 1
    if (session.startedAt) {
      day.minutes +=
        Math.max(0, session.finishedAt.getTime() - session.startedAt.getTime()) / MINUTE_MS
    }
  }

  const earned = new Map<string, PlayAdminLeader>()

  for (const seat of seats) {
    const at = seat.session.finishedAt
    if (!at) continue

    const day = days.get(dayKey(at))

    if (day) {
      day.who.add(seat.accountId)
      day.xp += seat.xp
    }

    // The ranking looks at the week only
    if (at >= weekAgo) {
      const row = earned.get(seat.accountId) ?? {
        accountId: seat.accountId,
        name: seat.account.displayName,
        avatarUrl: seat.account.avatarUrl,
        xp: 0,
        played: 0,
      }
      row.xp += seat.xp
      row.played += 1
      earned.set(seat.accountId, row)
    }
  }

  const weekPlayers = new Set<string>()
  for (const seat of seats) {
    if (seat.session.finishedAt && seat.session.finishedAt >= weekAgo)
      weekPlayers.add(seat.accountId)
  }

  return {
    days: [...days.values()].map(({ who, ...day }) => ({
      ...day,
      players: who.size,
      minutes: Math.round(day.minutes),
    })),
    hours,
    leaders: [...earned.values()].toSorted((a, b) => b.xp - a.xp).slice(0, LEADERS),
    lobby,
    running,
    finishedToday,
    finishedWeek,
    activeWeek: weekPlayers.size,
    games: PLAY_GAMES.keys
      .map((game) => ({ game, finished: total.get(game) ?? 0, week: week.get(game) ?? 0 }))
      .filter((row) => row.finished > 0)
      .toSorted((a, b) => b.week - a.week || b.finished - a.finished),
  }
}
