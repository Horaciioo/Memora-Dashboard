import 'server-only'

import { PlayNoticeKind } from '@prisma/client'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { isFeatureOn } from '@/core/services/features'
import { rankScores, xpPartsOf } from '@/core/lib/play'
import { boostsOf, questBoostOf } from '@/core/lib/play/boost'
import type { PlayBoost } from '@/core/lib/play/boost'
import { PLAY_JOURNAL, PLAY_OUTCOME_LABELS, PLAY_SETTINGS, PlayXpParts } from '@/declarations/play'
import { readPlayConfig } from '@/core/services/play/PlayConfigService'
import { journalPlay } from '@/core/services/play/PlayJournalService'
import type { PlayJournalInput } from '@/core/services/play/PlayJournalService'
import { humanResults } from '@/core/services/play/bots/BotRewardService'
import { recordResults } from '@/core/services/play/StatService'
import { advanceTournament } from '@/core/services/play/TournamentService'
import { tellFollowers } from '@/core/services/play/PlayFollowService'
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
 * Players with a game already played
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession['game']} game - Game
 * @param {string[]} accountIds - Players
 * @return {Promise<Set<string>>} - Veterans
 */

const veteransOf = async (
  tx: Prisma.TransactionClient,
  game: LoadedSession['game'],
  accountIds: string[]
): Promise<Set<string>> => {
  const stats = await tx.playGameStat.findMany({
    where: { game, played: { gt: 0 }, accountId: { in: accountIds } },
    select: { accountId: true },
  })

  return new Set(stats.map((stat) => stat.accountId))
}

/**
 * Players who already won this game
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession['game']} game - Game
 * @param {string[]} accountIds - Players
 * @return {Promise<Set<string>>} - Past winners
 */

const winnersOf = async (
  tx: Prisma.TransactionClient,
  game: LoadedSession['game'],
  accountIds: string[]
): Promise<Set<string>> => {
  const stats = await tx.playGameStat.findMany({
    where: { game, wins: { gt: 0 }, accountId: { in: accountIds } },
    select: { accountId: true },
  })

  return new Set(stats.map((stat) => stat.accountId))
}

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
  const pays =
    !session.tournamentId && isRewarded(session, seconds) && (await isFeatureOn('play.xp'))
  // A first game on this game pays more
  const veterans = await veteransOf(
    tx,
    session.game,
    standings.map((entry) => entry.accountId)
  )
  // A first win on this game pays more still
  const winners = await winnersOf(
    tx,
    session.game,
    standings.map((entry) => entry.accountId)
  )
  // Some games pay their winner more
  const winnerFactor = engineOf(session.game).winnerMultiplier?.(session.settings) ?? 1
  const bots = new Set(seats.filter((seat) => seat.account.botKind).map((seat) => seat.accountId))
  const botRatio = bots.size ? PLAY_SETTINGS.rewards.botXpRatio : 1
  // Featured and event boosts live at the end of the game
  const boosts = boostsOf(await readPlayConfig(), session.game)
  // A finished group quest boosts its members everywhere
  const profiles = await tx.playProfile.findMany({
    where: { accountId: { in: standings.map((entry) => entry.accountId) } },
    select: { accountId: true, questBoostUntil: true },
  })
  const questBoosts = new Map(
    profiles.map((profile) => [profile.accountId, questBoostOf(profile.questBoostUntil)])
  )
  const mine = (accountId: string): PlayBoost[] => {
    const quest = questBoosts.get(accountId)

    return quest ? [...boosts, quest] : boosts
  }
  const partsOf = new Map(
    standings.map((standing) => [
      standing.accountId,
      pays && !gone.has(standing.accountId)
        ? xpPartsOf({
            outcome: standing.outcome,
            isFirstGame: !veterans.has(standing.accountId),
            isFirstWin: !winners.has(standing.accountId),
            winnerFactor,
            botRatio,
            boosts: mine(standing.accountId),
          })
        : [],
    ])
  )
  const ranked = standings.map((standing) => ({
    ...standing,
    xp: (partsOf.get(standing.accountId) ?? []).reduce(
      (sum, part) => sum + (part.key === PlayXpParts.Bots ? 0 : part.xp),
      0
    ),
  }))
  // Bots ranked, never paid
  const results = humanResults(ranked, bots)
  const paid = new Map(results.map((result) => [result.accountId, result.xp]))

  for (const result of ranked) {
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId: result.accountId } },
      data: {
        rank: result.rank,
        outcome: result.outcome,
        xp: paid.get(result.accountId) ?? 0,
        xpParts: (partsOf.get(result.accountId) ?? []) as unknown as Prisma.InputJsonValue,
      },
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
  await tellFollowers(sessionId, PlayNoticeKind.FINISHED)

  return true
}
