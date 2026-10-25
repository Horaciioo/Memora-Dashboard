import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import {
  BaccalaureatPhases,
  fitsLetter,
  keepsAnswer,
  roundPhase,
  scoreAnswers,
} from '@/core/lib/play/baccalaureat'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { latestRound } from '@/core/services/play/baccalaureat/BaccalaureatRoundService'

/**
 * Judge someone else's word
 * @param {EngineSession} session - Game
 * @param {string} accountId - Voter
 * @param {Record<string, unknown>} raw - Body with answerId and accepted
 * @return {Promise<EngineStep>} - Step
 */

export const castVote = async (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const answerId = readBodyText(raw, 'answerId', PLAY_ERRORS.unknownAction)
  const answer = await prisma.baccalaureatAnswer.findFirst({
    where: { id: answerId, round: { sessionId: session.id } },
    include: { round: true },
  })
  if (!answer) throw notFound(PLAY_ERRORS.roundMissing)
  if (roundPhase(answer.round) !== BaccalaureatPhases.Review)
    throw conflict(PLAY_ERRORS.notReviewing)
  if (answer.accountId === accountId) throw forbidden(PLAY_ERRORS.ownAnswer)

  const accepted = raw.accepted !== false
  await prisma.baccalaureatVote.upsert({
    where: { answerId_voterId: { answerId, voterId: accountId } },
    create: { answerId, voterId: accountId, accepted },
    update: { accepted },
  })

  return { changed: true, finished: false, deadline: null }
}

/**
 * Count the round, once
 * @param {EngineSession} session - Game
 * @param {string} roundId - Round
 * @return {Promise<boolean>} - Counted by this call
 */

export const scoreRound = async (session: EngineSession, roundId: string): Promise<boolean> =>
  prisma.$transaction(async (tx) => {
    // Claim the count
    const { count } = await tx.baccalaureatRound.updateMany({
      where: { id: roundId, closedAt: { not: null }, scoredAt: null },
      data: { scoredAt: new Date() },
    })
    if (!count) return false

    const round = await tx.baccalaureatRound.findUniqueOrThrow({
      where: { id: roundId },
      include: { answers: { include: { votes: true } } },
    })

    // Verdict of the others still seated
    const judged = round.answers.map((answer) => {
      const voters = session.players.filter((player) => player !== answer.accountId).length
      const rejects = answer.votes.filter(
        (vote) => !vote.accepted && vote.voterId !== answer.accountId
      ).length

      return {
        ...answer,
        valid: keepsAnswer({ fits: fitsLetter(answer.word, round.letter), rejects, voters }),
      }
    })
    const points = scoreAnswers(judged)

    // Answers grouped by result
    const groups = Map.groupBy(judged, (answer) => `${answer.valid}:${points.get(answer.id) ?? 0}`)
    for (const [key, answers] of groups) {
      const [valid, value] = key.split(':')
      await tx.baccalaureatAnswer.updateMany({
        where: { id: { in: answers.map((answer) => answer.id) } },
        data: { valid: valid === 'true', points: Number(value) },
      })
    }

    // Seat totals
    const earned = Map.groupBy(judged, (answer) => answer.accountId)
    for (const [accountId, answers] of earned) {
      const total = answers.reduce((sum, answer) => sum + (points.get(answer.id) ?? 0), 0)
      if (total) {
        await tx.playSeat.updateMany({
          where: { sessionId: session.id, accountId },
          data: { score: { increment: total } },
        })
      }
    }

    return true
  })

/**
 * Host cuts the review short
 * @param {EngineSession} session - Game
 * @return {Promise<string>} - Round to count
 */

export const reviewedRoundId = async (session: EngineSession): Promise<string> => {
  const round = await latestRound(session.id)
  if (!round || roundPhase(round) !== BaccalaureatPhases.Review)
    throw conflict(PLAY_ERRORS.notReviewing)

  return round.id
}
