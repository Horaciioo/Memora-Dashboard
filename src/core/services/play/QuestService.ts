import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import {
  questDay,
  questProgress,
  questReward,
  questsOfDay,
  streakOf,
  streakPercent,
} from '@/core/lib/play/quests'
import type { DailyQuest, FinishedSeat } from '@/core/lib/play/quests'
import { noteGain } from '@/core/services/play/PlayActivityService'
import { PLAY_GAMES } from '@/declarations/play/games'
import {
  PLAY_QUEST_BONUS_KEY,
  PLAY_QUEST_HISTORY_DAYS,
  PLAY_QUEST_RULES,
} from '@/declarations/play/quests'
import type { PlayGameName } from '@/utils/constants/play'

const DAY_MS = 86_400_000

/**
 * A quest with its progress and reward
 * @typedef {Object} QuestState
 */

export interface QuestState extends DailyQuest {
  done: number
  reward: number
  isClaimed: boolean
}

/**
 * Whole page of quests of a player
 * @typedef {Object} QuestBoard
 */

export interface QuestBoard {
  day: string
  streak: number
  percent: number
  isTodayPlayed: boolean
  // Last days of the track, oldest first
  track: { day: string; isPlayed: boolean }[]
  main: QuestState
  sides: QuestState[]
  bonus: { done: number; total: number; xp: number; isClaimed: boolean }
}

const playableGames = (): PlayGameName[] =>
  PLAY_GAMES.keys.filter((game) => PLAY_GAMES.get(game).playable)

// Seats the player finished lately
const readFinished = async (accountId: string, now: Date): Promise<FinishedSeat[]> => {
  const since = new Date(now.getTime() - PLAY_QUEST_HISTORY_DAYS * DAY_MS)
  const seats = await prisma.playSeat.findMany({
    where: {
      accountId,
      outcome: { not: null },
      kickedAt: null,
      session: { finishedAt: { gte: since } },
    },
    select: {
      outcome: true,
      rank: true,
      xp: true,
      session: {
        select: {
          game: true,
          finishedAt: true,
          startedAt: true,
          visibility: true,
          _count: { select: { seats: { where: { kickedAt: null } } } },
        },
      },
    },
  })

  return seats.flatMap((seat) =>
    seat.session.finishedAt
      ? [
          {
            day: questDay(seat.session.finishedAt),
            game: seat.session.game,
            isWin: seat.outcome === 'WIN',
            rank: seat.rank,
            xp: seat.xp,
            players: seat.session._count.seats,
            isPrivate: seat.session.visibility === 'PRIVATE',
            minutes: seat.session.startedAt
              ? (seat.session.finishedAt.getTime() - seat.session.startedAt.getTime()) / 60000
              : Infinity,
          },
        ]
      : []
  )
}

/**
 * Quests of today for a player, with streak and bonus
 * @param {string} accountId - Player
 * @param {Date} [now] - Moment
 * @return {Promise<QuestBoard>} - Board
 */

export const readQuestBoard = async (accountId: string, now = new Date()): Promise<QuestBoard> => {
  const day = questDay(now)
  const [finished, claims] = await Promise.all([
    readFinished(accountId, now),
    prisma.playQuestClaim.findMany({ where: { accountId, day }, select: { slot: true } }),
  ])
  const played = new Set(finished.map((seat) => seat.day))
  const streak = streakOf(day, played)
  const today = finished.filter((seat) => seat.day === day)
  const claimed = new Set(claims.map((claim) => claim.slot))

  const states = questsOfDay(day, playableGames()).map((quest): QuestState => ({
    ...quest,
    done: questProgress(quest, today),
    reward: questReward(quest.xp, streak),
    isClaimed: claimed.has(quest.slot),
  }))
  const [main, ...sides] = states
  const track = Array.from({ length: PLAY_QUEST_RULES.trackDays }, (_, index) => {
    const date = questDay(
      new Date(now.getTime() - (PLAY_QUEST_RULES.trackDays - 1 - index) * DAY_MS)
    )

    return { day: date, isPlayed: played.has(date) }
  })

  return {
    day,
    streak,
    percent: streakPercent(streak),
    isTodayPlayed: played.has(day),
    track,
    main,
    sides,
    bonus: {
      done: states.filter((state) => state.done >= state.target).length,
      total: states.length,
      xp: PLAY_QUEST_RULES.bonusXp,
      isClaimed: claimed.has(PLAY_QUEST_BONUS_KEY),
    },
  }
}

/**
 * Pay the reward of one finished quest, or the bonus, once
 * @param {string} accountId - Player
 * @param {string} slot - Quest slot or the bonus key
 * @return {Promise<number>} - XP paid, 0 when not owed
 */

export const claimQuest = async (accountId: string, slot: string): Promise<number> => {
  const board = await readQuestBoard(accountId)
  const states = [board.main, ...board.sides]
  const quest = states.find((state) => state.slot === slot)
  const isBonus = slot === PLAY_QUEST_BONUS_KEY

  const xp = isBonus
    ? board.bonus.done >= board.bonus.total && !board.bonus.isClaimed
      ? board.bonus.xp
      : 0
    : quest && quest.done >= quest.target && !quest.isClaimed
      ? quest.reward
      : 0
  if (!xp) return 0

  try {
    await prisma.$transaction(async (tx) => {
      await tx.playQuestClaim.create({ data: { accountId, day: board.day, slot, xp } })
      await tx.playProfile.upsert({
        where: { accountId },
        create: { accountId, bonusXp: xp },
        update: { bonusXp: { increment: xp } },
      })
      await noteGain(tx, accountId, { kind: 'QUEST', xp, ref: slot })
    })
  } catch (error) {
    // Already taken by a second click
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return 0
    throw error
  }

  return xp
}
