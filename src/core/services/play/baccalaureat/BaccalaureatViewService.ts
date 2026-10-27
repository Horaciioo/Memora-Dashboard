import 'server-only'

import { prisma } from '@/core/lib/db'
import {
  BaccalaureatPhases,
  baccalaureatSettingsOf,
  isCustomCategory,
  roundPhase,
} from '@/core/lib/play/baccalaureat'
import { lookUpWords } from '@/core/lib/play/baccalaureat/dictionary'
import { baccalaureatRecap } from '@/core/services/play/baccalaureat/BaccalaureatRecapService'
import {
  BACCALAUREAT_CATEGORIES,
  BACCALAUREAT_SETTINGS,
  isBaccalaureatCategory,
} from '@/declarations/play'
import type { EngineSession } from '@/types/play'

/**
 * Category worth a dictionary hint
 * @param {string} category - Category id
 * @return {boolean} - Hinted
 */

const usesDictionary = (category: string): boolean =>
  isBaccalaureatCategory(category)
    ? BACCALAUREAT_CATEGORIES[category].dictionary
    : isCustomCategory(category)

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
 * One line of the session feed
 * @typedef {Object} BacFeedEntry
 */

export interface BacFeedEntry {
  id: string
  kind: 'letter' | 'finished' | 'stopped' | 'closed' | 'scored'
  accountId: string | null
  at: Date
  values: { index: number; letter: string }
}

/**
 * Feed of a game, read from its rounds, newest first
 * @param {object[]} rounds - Rounds with their dates
 * @param {object[]} totals - Answers per round and player
 * @param {number} categories - Fields to fill
 * @return {BacFeedEntry[]} - Lines
 */

const sessionFeed = (
  rounds: {
    id: string
    index: number
    letter: string
    startsAt: Date
    endsAt: Date
    closedAt: Date | null
    scoredAt: Date | null
    stoppedById: string | null
  }[],
  totals: {
    roundId: string
    accountId: string
    _count: { _all: number }
    _max: { updatedAt: Date | null }
  }[],
  categories: number
): BacFeedEntry[] => {
  const now = new Date()
  const line = (
    round: (typeof rounds)[number],
    kind: BacFeedEntry['kind'],
    at: Date,
    accountId: string | null = null
  ): BacFeedEntry => ({
    id: `${round.id}-${kind}-${accountId ?? ''}`,
    kind,
    accountId,
    at,
    values: { index: round.index + 1, letter: round.letter },
  })

  return rounds
    .filter((round) => round.startsAt <= now)
    .flatMap((round) => [
      line(round, 'letter', round.startsAt),
      ...totals
        .filter((total) => total.roundId === round.id && total._count._all >= categories)
        .map((total) =>
          line(round, 'finished', total._max.updatedAt ?? round.startsAt, total.accountId)
        ),
      // Stop ends the clock
      ...(round.stoppedById ? [line(round, 'stopped', round.endsAt, round.stoppedById)] : []),
      ...(round.closedAt ? [line(round, 'closed', round.closedAt)] : []),
      ...(round.scoredAt ? [line(round, 'scored', round.scoredAt)] : []),
    ])
    .sort((left, right) => right.at.getTime() - left.at.getTime())
}

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
      select: {
        id: true,
        index: true,
        letter: true,
        startsAt: true,
        endsAt: true,
        closedAt: true,
        scoredAt: true,
        stoppedById: true,
        bonus: true,
        rerolledById: true,
      },
    }),
    prisma.baccalaureatAnswer.groupBy({
      by: ['roundId', 'accountId'],
      where: { round: { sessionId: session.id } },
      _sum: { points: true },
      _count: { _all: true },
      _max: { updatedAt: true },
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
  const isComplete = phase === BaccalaureatPhases.Scored && rounds.length >= settings.rounds

  // Drafts stay private while writing
  const isOpen = phase === BaccalaureatPhases.Countdown || phase === BaccalaureatPhases.Writing
  const shown = (round?.answers ?? []).filter((answer) => !isOpen || answer.accountId === viewerId)

  // Dictionary hints once words are out
  const hinted = shown.filter((answer) => !isOpen && usesDictionary(answer.category))
  const hints = await lookUpWords(hinted.map((answer) => answer.word))
  const answers = shown.map(({ votes, ...answer }) => ({
    ...answer,
    inDictionary: hints.get(answer.word) ?? null,
    acceptedBy: votes.filter((vote) => vote.accepted).map((vote) => vote.voterId),
    rejectedBy: votes.filter((vote) => !vote.accepted).map((vote) => vote.voterId),
    myVote: votes.find((vote) => vote.voterId === viewerId)?.accepted ?? null,
  }))

  // Players done with the latest round
  const done = totals
    .filter(
      (total) => total.roundId === latest?.id && total._count._all >= settings.categories.length
    )
    .map((total) => total.accountId)

  return {
    settings,
    done,
    feed: sessionFeed(rounds, totals, settings.categories.length),
    roundsTotal: settings.rounds,
    history: rounds.map((entry) => ({
      index: entry.index,
      letter: entry.letter,
      isScored: Boolean(entry.scoredAt),
      bonus: entry.bonus,
      stoppedById: entry.stoppedById,
      points: Object.fromEntries(
        totals
          .filter((total) => total.roundId === entry.id)
          .map((total) => [
            total.accountId,
            (total._sum.points ?? 0) + (total.accountId === entry.stoppedById ? entry.bonus : 0),
          ])
      ),
    })),
    jokersLeft: Math.max(
      0,
      BACCALAUREAT_SETTINGS.jokersPerPlayer -
        rounds.filter((entry) => entry.rerolledById === viewerId).length
    ),
    recap: isComplete
      ? await baccalaureatRecap(
          session.id,
          new Map(settings.categories.map((entry) => [entry.id, entry.label]))
        )
      : null,
    round: round && {
      index: round.index,
      letter: round.letter,
      phase,
      startsAt: round.startsAt,
      endsAt: round.endsAt,
      reviewEndsAt: round.reviewEndsAt,
      stoppedById: round.stoppedById,
      rerolledById: round.rerolledById,
      bonus: round.bonus,
      answers,
    },
    serverTime: new Date(),
  }
}
