import 'server-only'

import { prisma } from '@/core/lib/db'
import { BaccalaureatPhases, roundPhase } from '@/core/lib/play/baccalaureat'
import type { EngineSession } from '@/types/play'
import { baccalaureatSettingsOf } from '@/core/lib/play/baccalaureat/settings'

// Answer fields shown on the board
const ANSWER_SELECT = {
  id: true,
  accountId: true,
  category: true,
  word: true,
  valid: true,
  points: true,
  votes: { select: { voterId: true, accepted: true } },
} as const

/**
 * Board of a Baccalaureat game
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const baccalaureatView = async (session: EngineSession, viewerId: string) => {
  const settings = baccalaureatSettingsOf(session.settings)
  const [rounds, totals] = await Promise.all([
    prisma.baccalaureatRound.findMany({
      where: { sessionId: session.id },
      orderBy: { index: 'asc' },
      select: { id: true, index: true, letter: true, scoredAt: true },
    }),
    prisma.baccalaureatAnswer.groupBy({
      by: ['roundId', 'accountId'],
      where: { round: { sessionId: session.id } },
      _sum: { points: true },
    }),
  ])

  const latest = rounds.at(-1)
  const round = latest
    ? await prisma.baccalaureatRound.findUniqueOrThrow({
        where: { id: latest.id },
        include: { answers: { select: ANSWER_SELECT } },
      })
    : null
  const phase = round ? roundPhase(round) : null

  // Drafts stay private while writing
  const isOpen = phase === BaccalaureatPhases.Countdown || phase === BaccalaureatPhases.Writing
  const answers = (round?.answers ?? [])
    .filter((answer) => !isOpen || answer.accountId === viewerId)
    .map(({ votes, ...answer }) => ({
      ...answer,
      rejects: votes.filter((vote) => !vote.accepted).length,
      myVote: votes.find((vote) => vote.voterId === viewerId)?.accepted ?? null,
    }))

  return {
    settings,
    roundsTotal: settings.rounds,
    history: rounds.map((entry) => ({
      index: entry.index,
      letter: entry.letter,
      isScored: Boolean(entry.scoredAt),
      points: Object.fromEntries(
        totals
          .filter((total) => total.roundId === entry.id)
          .map((total) => [total.accountId, total._sum.points ?? 0])
      ),
    })),
    round: round && {
      index: round.index,
      letter: round.letter,
      phase,
      startsAt: round.startsAt,
      endsAt: round.endsAt,
      reviewEndsAt: round.reviewEndsAt,
      stoppedById: round.stoppedById,
      answers,
    },
    serverTime: new Date(),
  }
}
