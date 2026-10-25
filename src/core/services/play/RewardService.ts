import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { outcomeXp, rankScores } from '@/core/lib/play'
import { PLAY_SETTINGS } from '@/declarations/play'
import { recordResults } from '@/core/services/play/StatService'
import { advanceTournament } from '@/core/services/play/TournamentService'
import { engineOf, loadSession } from '@/core/services/play/PlaySessionService'
import { isPresent } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { PlayStatuses } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Game long and crowded enough to pay XP
 * @param {LoadedSession} session - Game
 * @param {number} seconds - Duration
 * @return {boolean} - Rewarded
 */

const isRewarded = (session: LoadedSession, seconds: number): boolean =>
  session.seats.filter((seat) => !seat.kickedAt).length >= PLAY_SETTINGS.rewards.minPlayers &&
  seconds >= PLAY_SETTINGS.rewards.minSeconds

/**
 * Write ranks, outcomes, XP and totals of a finished game
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession} session - Game
 * @param {Map<string, Record<string, number>>} extra - Game counters
 * @return {Promise<void>} - Written
 */

const writeResults = async (
  tx: Prisma.TransactionClient,
  session: LoadedSession,
  extra: Map<string, Record<string, number>>
): Promise<void> => {
  const finishedAt = new Date()
  const seconds = Math.round(
    (finishedAt.getTime() - (session.startedAt ?? finishedAt).getTime()) / SECOND_MS
  )
  const seats = session.seats.filter((seat) => !seat.kickedAt)
  const gone = new Set(seats.filter((seat) => !isPresent(seat)).map((seat) => seat.accountId))
  const standings = rankScores(new Map(seats.map((seat) => [seat.accountId, seat.score])), gone)

  // Tournament games pay at the end of the tournament
  const pays = !session.tournamentId && isRewarded(session, seconds)
  const results = standings.map((standing) => ({
    ...standing,
    xp: pays && !gone.has(standing.accountId) ? outcomeXp(standing.outcome) : 0,
  }))

  for (const result of results) {
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId: result.accountId } },
      data: { rank: result.rank, outcome: result.outcome, xp: result.xp },
    })
  }

  await recordResults(
    tx,
    session.game,
    results.map((result) => ({
      accountId: result.accountId,
      outcome: gone.has(result.accountId) ? null : result.outcome,
      abandoned: gone.has(result.accountId),
      xp: result.xp,
      seconds,
      extra: extra.get(result.accountId),
    }))
  )
}

/**
 * Close a game and pay its players, once
 * @param {string} sessionId - Game
 * @return {Promise<boolean>} - Closed by this call
 */

export const finishSession = async (sessionId: string): Promise<boolean> => {
  const session = await loadSession(sessionId)
  const extra = await engineOf(session.game).extraStats(sessionId)

  const closed = await prisma.$transaction(async (tx) => {
    // Claim the end
    const { count } = await tx.playSession.updateMany({
      where: { id: sessionId, status: PlayStatuses.Running },
      data: { status: PlayStatuses.Finished, finishedAt: new Date() },
    })
    if (!count) return false

    await writeResults(tx, await loadSession(sessionId, tx), extra)

    return true
  })

  if (closed && session.tournamentId) await advanceTournament(sessionId)

  return closed
}
