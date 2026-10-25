import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { readBodyMap } from '@/core/lib/play'
import { after } from '@/core/lib/play/clock'
import { BaccalaureatPhases, drawLetter, roundPhase } from '@/core/lib/play/baccalaureat'
import { BACCALAUREAT_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { baccalaureatSettingsOf } from '@/core/lib/play/baccalaureat/settings'

/**
 * Latest round of a game
 * @param {string} sessionId - Game
 * @return {Promise<BaccalaureatRound | null>} - Round
 */

export const latestRound = (sessionId: string) =>
  prisma.baccalaureatRound.findFirst({ where: { sessionId }, orderBy: { index: 'desc' } })

/**
 * Deadline of a round still open
 * @param {{ endsAt: Date }} round - Round
 * @return {Date} - Closing time
 */

export const closingAt = (round: { endsAt: Date }): Date =>
  after(round.endsAt, BACCALAUREAT_SETTINGS.submitGraceSeconds)

/**
 * Open the next round, countdown first
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openRound = async (session: EngineSession): Promise<EngineStep> => {
  const settings = baccalaureatSettingsOf(session.settings)
  const previous = await prisma.baccalaureatRound.findMany({
    where: { sessionId: session.id },
    select: { letter: true },
  })

  // Last round played
  if (previous.length >= settings.rounds) return { changed: true, finished: true, deadline: null }

  const startsAt = after(new Date(), BACCALAUREAT_SETTINGS.countdownSeconds)
  const round = await prisma.baccalaureatRound.create({
    data: {
      sessionId: session.id,
      index: previous.length,
      letter: drawLetter(
        settings.letters,
        previous.map((entry) => entry.letter)
      ),
      startsAt,
      endsAt: after(startsAt, settings.roundSeconds),
    },
  })

  return { changed: true, finished: false, deadline: closingAt(round) }
}

/**
 * Round open for writing
 * @param {string} sessionId - Game
 * @return {Promise<BaccalaureatRound>} - Round
 */

const writableRound = async (sessionId: string) => {
  const round = await latestRound(sessionId)
  if (!round) throw notFound(PLAY_ERRORS.roundMissing)
  if (roundPhase(round) !== BaccalaureatPhases.Writing || new Date() > closingAt(round)) {
    throw conflict(PLAY_ERRORS.roundClosed)
  }

  return round
}

/**
 * Save a player's words
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with answers
 * @return {Promise<EngineStep>} - Step
 */

export const writeAnswers = async (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const round = await writableRound(session.id)
  const known = new Set(
    baccalaureatSettingsOf(session.settings).categories.map((entry) => entry.id)
  )

  // Known categories, bounded words
  const answers = Object.entries(readBodyMap(raw, 'answers'))
    .filter(([category]) => known.has(category))
    .map(([category, word]) => ({
      category,
      word: word.trim().slice(0, BACCALAUREAT_SETTINGS.wordLength),
    }))
  const filled = answers.filter((answer) => answer.word)
  const cleared = answers.filter((answer) => !answer.word).map((answer) => answer.category)
  const where = { roundId: round.id, accountId }
  const before = await prisma.baccalaureatAnswer.count({ where })

  await prisma.$transaction([
    prisma.baccalaureatAnswer.deleteMany({
      where: { roundId: round.id, accountId, category: { in: cleared } },
    }),
    ...filled.map(({ category, word }) =>
      prisma.baccalaureatAnswer.upsert({
        where: { roundId_accountId_category: { roundId: round.id, accountId, category } },
        create: { roundId: round.id, accountId, category, word },
        update: { word },
      })
    ),
  ])

  // Drafts stay private, the table only hears a player finish or reopen
  const count = await prisma.baccalaureatAnswer.count({ where })
  const changed = before >= known.size !== count >= known.size

  // First one done stops the round on their behalf
  const settings = baccalaureatSettingsOf(session.settings)
  if (changed && count >= known.size && settings.stop && settings.autoStop) {
    const stopped = await stopRound(round.id, accountId)
    if (stopped) return stopped
  }

  return { changed, finished: false, deadline: null }
}

/**
 * Shout stop once every category is filled
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @return {Promise<EngineStep>} - Step
 */

export const callStop = async (session: EngineSession, accountId: string): Promise<EngineStep> => {
  const settings = baccalaureatSettingsOf(session.settings)
  if (!settings.stop) throw forbidden(PLAY_ERRORS.stopDisabled)

  const round = await writableRound(session.id)
  const filled = await prisma.baccalaureatAnswer.count({ where: { roundId: round.id, accountId } })
  if (filled < settings.categories.length) throw conflict(PLAY_ERRORS.stopIncomplete)

  return (
    (await stopRound(round.id, accountId)) ?? { changed: false, finished: false, deadline: null }
  )
}

/**
 * Shorten the clock of a round, first stop wins
 * @param {string} roundId - Round
 * @param {string} accountId - Stopper
 * @return {Promise<EngineStep | null>} - Step, null when already stopped
 */

const stopRound = async (roundId: string, accountId: string): Promise<EngineStep | null> => {
  const endsAt = after(new Date(), BACCALAUREAT_SETTINGS.stop.graceSeconds)
  const { count } = await prisma.baccalaureatRound.updateMany({
    where: { id: roundId, stoppedById: null, endsAt: { gt: endsAt } },
    data: { stoppedById: accountId, endsAt },
  })

  return count > 0 ? { changed: true, finished: false, deadline: closingAt({ endsAt }) } : null
}

/**
 * Close writing, open the review
 * @param {string} roundId - Round
 * @return {Promise<Date | null>} - Review end, null when already closed
 */

export const closeRound = async (roundId: string): Promise<Date | null> => {
  const closedAt = new Date()
  const reviewEndsAt = after(closedAt, BACCALAUREAT_SETTINGS.reviewSeconds)
  const { count } = await prisma.baccalaureatRound.updateMany({
    where: { id: roundId, closedAt: null },
    data: { closedAt, reviewEndsAt },
  })

  return count > 0 ? reviewEndsAt : null
}

/**
 * Spend a letter joker during the countdown
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @return {Promise<EngineStep>} - Step
 */

export const rerollLetter = async (
  session: EngineSession,
  accountId: string
): Promise<EngineStep> => {
  const round = await latestRound(session.id)
  if (!round || roundPhase(round) !== BaccalaureatPhases.Countdown)
    throw conflict(PLAY_ERRORS.notCountdown)

  const spent = await prisma.baccalaureatRound.count({
    where: { sessionId: session.id, rerolledById: accountId },
  })
  if (spent >= BACCALAUREAT_SETTINGS.jokersPerPlayer) throw conflict(PLAY_ERRORS.noJoker)

  // New letter, countdown restarts
  const settings = baccalaureatSettingsOf(session.settings)
  const drawn = await prisma.baccalaureatRound.findMany({
    where: { sessionId: session.id },
    select: { letter: true },
  })
  const startsAt = after(new Date(), BACCALAUREAT_SETTINGS.countdownSeconds)
  const endsAt = after(startsAt, settings.roundSeconds)
  const { count } = await prisma.baccalaureatRound.updateMany({
    where: { id: round.id, rerolledById: null },
    data: {
      rerolledById: accountId,
      letter: drawLetter(
        settings.letters,
        drawn.map((entry) => entry.letter)
      ),
      startsAt,
      endsAt,
    },
  })
  if (!count) throw conflict(PLAY_ERRORS.jokerTaken)

  return { changed: true, finished: false, deadline: closingAt({ endsAt }) }
}
