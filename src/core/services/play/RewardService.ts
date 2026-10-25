import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { outcomeXp, rankScores } from '@/core/lib/play'
import { PLAY_JOURNAL, PLAY_OUTCOME_LABELS, PLAY_SETTINGS } from '@/declarations/play'
import { journalPlay } from '@/core/services/play/PlayJournalService'
import type { PlayJournalInput } from '@/core/services/play/PlayJournalService'
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
 * @return {Promise<PlayJournalInput[]>} - Journal lines
 */

const writeResults = async (
  tx: Prisma.TransactionClient,
  session: LoadedSession,
  extra: Map<string, Record<string, number>>
): Promise<PlayJournalInput[]> => {
  const finishedAt = new Date()
  const seconds = Math.round(
    (finishedAt.getTime() - (session.startedAt ?? finishedAt).getTime()) / SECOND_MS
  )
  const seats = session.seats.filter((seat) => !seat.kickedAt)
  const gone = new Set(seats.filter((seat) => !isPresent(seat)).map((seat) => seat.accountId))
  const standings = rankScores(new Map(seats.map((seat) => [seat.accountId, seat.score])), gone)

  // Tournament games pay at the end of the tournament
  const pays = !session.tournamentId && isRewarded(session, seconds)
  // A first game on this game pays more
  const veterans = new Set(
    (
      await tx.playGameStat.findMany({
        where: {
          game: session.game,
          played: { gt: 0 },
          accountId: { in: standings.map((entry) => entry.accountId) },
        },
        select: { accountId: true },
      })
    ).map((stat) => stat.accountId)
  )
  const results = standings.map((standing) => ({
    ...standing,
    xp:
      pays && !gone.has(standing.accountId)
        ? Math.round(
            outcomeXp(standing.outcome) *
              (veterans.has(standing.accountId) ? 1 : PLAY_SETTINGS.xp.firstGameMultiplier)
          )
        : 0,
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

  // One journal line per player
  return results.map((result) => ({
    eventType: 'PlayFinished',
    subjectId: result.accountId,
    actorId: null,
    game: session.game,
    sessionId: session.id,
    template: gone.has(result.accountId) ? PLAY_JOURNAL.abandoned : PLAY_JOURNAL.finished,
    values: { outcome: PLAY_OUTCOME_LABELS[result.outcome], xp: result.xp },
  }))
}

/**
 * Close a game and pay its players, once
 * @param {string} sessionId - Game
 * @return {Promise<boolean>} - Closed by this call
 */

export const finishSession = async (sessionId: string): Promise<boolean> => {
  const session = await loadSession(sessionId)
  const extra = await engineOf(session.game).extraStats(sessionId)

  const lines = await prisma.$transaction(async (tx) => {
    // Claim the end
    const { count } = await tx.playSession.updateMany({
      where: { id: sessionId, status: PlayStatuses.Running },
      data: { status: PlayStatuses.Finished, finishedAt: new Date() },
    })
    if (!count) return null

    return writeResults(tx, await loadSession(sessionId, tx), extra)
  })
  if (!lines) return false

  await journalPlay(...lines)

  if (session.tournamentId) await advanceTournament(sessionId)

  return true
}
