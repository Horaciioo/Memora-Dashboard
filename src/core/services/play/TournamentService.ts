import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { rankScores, tournamentXp } from '@/core/lib/play'
import { PLAY_SETTINGS } from '@/declarations/play'
import { recordResults } from '@/core/services/play/StatService'
import { isPresent, loadSession } from '@/core/services/play/lookups'
import type { LoadedSession } from '@/core/services/play/lookups'
import { PlayOutcomes, PlayStatuses } from '@/utils/constants/play'

/**
 * Open the next game with the same table
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession} session - Game just finished
 * @return {Promise<string>} - Next game
 */

const openNextGame = async (
  tx: Prisma.TransactionClient,
  session: LoadedSession
): Promise<string> => {
  const present = session.seats.filter(isPresent)
  const hostId = present.some((seat) => seat.accountId === session.hostId)
    ? session.hostId
    : (present[0]?.accountId ?? session.hostId)

  const next = await tx.playSession.create({
    data: {
      game: session.game,
      hostId,
      settings: session.settings as Prisma.InputJsonValue,
      tournamentId: session.tournamentId,
      tournamentIndex: (session.tournamentIndex ?? 0) + 1,
      seats: { create: present.map((seat) => ({ accountId: seat.accountId, color: seat.color })) },
    },
  })

  return next.id
}

/**
 * Rank the tournament and pay its players
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession} last - Last game
 * @return {Promise<void>} - Written
 */

const closeTournament = async (
  tx: Prisma.TransactionClient,
  last: LoadedSession
): Promise<void> => {
  const tournament = last.tournament!
  const seats = await tx.playSeat.findMany({
    where: { session: { tournamentId: tournament.id }, kickedAt: null },
    select: { accountId: true, score: true },
  })

  // Cumulated scores, only the last table contends
  const totals = new Map<string, number>()
  for (const seat of seats)
    totals.set(seat.accountId, (totals.get(seat.accountId) ?? 0) + seat.score)
  const gone = new Set(
    [...totals.keys()].filter(
      (accountId) => !last.seats.some((seat) => seat.accountId === accountId && isPresent(seat))
    )
  )
  const pays = totals.size - gone.size >= PLAY_SETTINGS.rewards.minPlayers

  await recordResults(
    tx,
    last.game,
    rankScores(totals, gone).map((standing) => ({
      accountId: standing.accountId,
      outcome: null,
      xp:
        pays && !gone.has(standing.accountId)
          ? tournamentXp(standing.outcome, tournament.gamesCount)
          : 0,
      seconds: 0,
      tournament: { won: !gone.has(standing.accountId) && standing.outcome === PlayOutcomes.Win },
    }))
  )
  await tx.playTournament.update({
    where: { id: tournament.id },
    data: { status: PlayStatuses.Finished, finishedAt: new Date() },
  })
}

/**
 * Chain the next game or close the tournament
 * @param {string} sessionId - Game just finished
 * @return {Promise<string | null>} - Next game
 */

export const advanceTournament = async (sessionId: string): Promise<string | null> =>
  prisma.$transaction(async (tx) => {
    const session = await loadSession(sessionId, tx)
    const tournament = session.tournament
    if (!tournament || tournament.status !== PlayStatuses.Running) return null

    const isLast = (session.tournamentIndex ?? 0) + 1 >= tournament.gamesCount
    const hasTable = session.seats.some(isPresent)
    if (!isLast && hasTable) return openNextGame(tx, session)

    await closeTournament(tx, session)

    return null
  })

/**
 * Standings of a tournament so far
 * @param {string} tournamentId - Tournament
 * @return {Promise<{ accountId: string, score: number }[]>} - Totals, best first
 */

export const tournamentStandings = async (tournamentId: string) => {
  const totals = await prisma.playSeat.groupBy({
    by: ['accountId'],
    where: { session: { tournamentId }, kickedAt: null },
    _sum: { score: true },
  })

  return totals
    .map((total) => ({ accountId: total.accountId, score: total._sum.score ?? 0 }))
    .sort((left, right) => right.score - left.score)
}
