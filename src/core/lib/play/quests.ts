import {
  PLAY_MAIN_TEMPLATES,
  PLAY_QUEST_RULES,
  PLAY_SIDE_TEMPLATES,
  PlayQuestKinds,
} from '@/declarations/play/quests'
import type { PlayQuestKind, PlayQuestSlot, PlayQuestTemplate } from '@/declarations/play/quests'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * One quest of the day
 * @typedef {Object} DailyQuest
 */

export interface DailyQuest extends PlayQuestTemplate {
  slot: PlayQuestSlot
  game: PlayGameName | null
}

// Time zone the day turns in
const QUEST_ZONE = 'Europe/Paris'

const DAY_MS = 86_400_000

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: QUEST_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * Calendar day of a moment, in the quest time zone
 * @param {Date} date - Moment
 * @return {string} - YYYY-MM-DD
 */

export const questDay = (date: Date): string => dayFormat.format(date)

/**
 * Day before a day key
 * @param {string} day - YYYY-MM-DD
 * @return {string} - YYYY-MM-DD
 */

export const previousDay = (day: string): string =>
  new Date(Date.parse(`${day}T12:00:00Z`) - DAY_MS).toISOString().slice(0, 10)

// Small deterministic generator from a text
const seeded = (text: string) => {
  let state = 2166136261
  for (const char of text) state = Math.imul(state ^ char.charCodeAt(0), 16777619)

  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822519) + 0x6d2b79f5
    state ^= state >>> 13

    return (state >>> 0) / 4294967296
  }
}

/**
 * Five quests of a day, the same for every player
 * @param {string} day - YYYY-MM-DD
 * @param {PlayGameName[]} games - Games that can be asked
 * @return {DailyQuest[]} - Main quest then four side quests
 */

export const questsOfDay = (day: string, games: PlayGameName[]): DailyQuest[] => {
  const random = seeded(day)
  const pool = [...games]
  const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)]
  const take = (): PlayGameName => pool.splice(Math.floor(random() * pool.length), 1)[0]

  const main = pick(PLAY_MAIN_TEMPLATES)
  const mainQuest: DailyQuest = { ...main, slot: 'main', game: main.isGame ? take() : null }
  // Four different kinds of side quest
  const kinds = [...PLAY_SIDE_TEMPLATES]
  const sides = (['side1', 'side2', 'side3', 'side4'] as const).map((slot): DailyQuest => {
    const template = kinds.splice(Math.floor(random() * kinds.length), 1)[0]

    return { ...template, slot, game: template.isGame ? take() : null }
  })

  return [mainQuest, ...sides]
}

/**
 * Seat finished by a player, as far as quests care
 * @typedef {Object} FinishedSeat
 */

export interface FinishedSeat {
  day: string
  game: PlayGameName
  isWin: boolean
  // Place at the end, null when unranked
  rank: number | null
  xp: number
  players: number
  isPrivate: boolean
  minutes: number
}

// Seats a quest of each kind counts, one by one
const COUNTS: Record<PlayQuestKind, (seat: FinishedSeat) => boolean> = {
  [PlayQuestKinds.Played]: () => true,
  [PlayQuestKinds.Wins]: (seat) => seat.isWin,
  [PlayQuestKinds.Variety]: () => true,
  [PlayQuestKinds.Podium]: (seat) =>
    seat.players >= PLAY_QUEST_RULES.crowdPlayers && seat.rank !== null && seat.rank <= 3,
  [PlayQuestKinds.Crowd]: (seat) => seat.players >= PLAY_QUEST_RULES.crowdPlayers,
  [PlayQuestKinds.Private]: (seat) => seat.isPrivate,
  [PlayQuestKinds.Blitz]: (seat) => seat.minutes < PLAY_QUEST_RULES.blitzMinutes,
  [PlayQuestKinds.Xp]: () => true,
}

/**
 * Progress of a quest over the seats of its day
 * @param {DailyQuest} quest - Quest
 * @param {FinishedSeat[]} seats - Seats finished that day
 * @return {number} - Count reached, capped at the target
 */

export const questProgress = (quest: DailyQuest, seats: FinishedSeat[]): number => {
  const mine = seats.filter(
    (seat) => (!quest.game || seat.game === quest.game) && COUNTS[quest.kind](seat)
  )
  const count =
    quest.kind === PlayQuestKinds.Variety
      ? new Set(mine.map((seat) => seat.game)).size
      : quest.kind === PlayQuestKinds.Xp
        ? mine.reduce((total, seat) => total + seat.xp, 0)
        : mine.length

  return Math.min(count, quest.target)
}

/**
 * Days in a row with a finished game, today still open if not played yet
 * @param {string} today - YYYY-MM-DD
 * @param {Set<string>} played - Days with a finished game
 * @return {number} - Streak length
 */

export const streakOf = (today: string, played: Set<string>): number => {
  let day = played.has(today) ? today : previousDay(today)
  let streak = 0
  while (played.has(day)) {
    streak++
    day = previousDay(day)
  }

  return streak
}

/**
 * Share added to every reward by the streak
 * @param {number} streak - Streak length
 * @return {number} - Percent
 */

export const streakPercent = (streak: number): number =>
  Math.min(streak * PLAY_QUEST_RULES.streakStep, PLAY_QUEST_RULES.streakCap)

/**
 * Reward after the streak
 * @param {number} xp - Base reward
 * @param {number} streak - Streak length
 * @return {number} - XP paid
 */

export const questReward = (xp: number, streak: number): number =>
  Math.round(xp * (1 + streakPercent(streak) / 100))
