import { PLAY_SETTINGS } from '@/declarations/play/settings'
import { PlayOutcomes } from '@/utils/constants/play'
import type { PlayOutcomeName } from '@/utils/constants/play'

/**
 * Where a player stands on the level ladder
 * @typedef {Object} PlayLevel
 * @property {number} level - Current level
 * @property {number} into - XP inside it
 * @property {number | null} needed - XP to the next one
 */

export interface PlayLevel {
  level: number
  into: number
  needed: number | null
}

// XP per outcome
const OUTCOME_XP: Record<PlayOutcomeName, number> = {
  [PlayOutcomes.Win]: PLAY_SETTINGS.xp.win,
  [PlayOutcomes.Draw]: PLAY_SETTINGS.xp.draw,
  [PlayOutcomes.Loss]: PLAY_SETTINGS.xp.loss,
}

// Ladder shape
const { base: BASE, step: STEP, max: MAX_LEVEL } = PLAY_SETTINGS.levels

/**
 * XP from one level to the next
 * @param {number} level - Starting level
 * @return {number} - XP needed
 */

export const xpToNext = (level: number): number => BASE + STEP * (level - 1)

/**
 * Total XP opening a level
 * @param {number} level - Target level
 * @return {number} - XP from zero
 */

export const xpForLevel = (level: number): number => {
  const climbs = Math.min(level, MAX_LEVEL) - 1

  // Arithmetic series of steps
  return climbs * BASE + (STEP * climbs * (climbs - 1)) / 2
}

/**
 * Level reached with some XP
 * @param {number} xp - Total XP
 * @return {PlayLevel} - Level standing
 */

export const levelOf = (xp: number): PlayLevel => {
  const total = Math.max(0, xp)
  const ceiling = xpForLevel(MAX_LEVEL)
  if (total >= ceiling) return { level: MAX_LEVEL, into: total - ceiling, needed: null }

  // Solve the series, then settle rounding
  const half = BASE - STEP / 2
  let level =
    1 + Math.floor(STEP ? (Math.sqrt(half ** 2 + 2 * STEP * total) - half) / STEP : total / BASE)
  while (xpForLevel(level) > total) level -= 1
  while (xpForLevel(level + 1) <= total) level += 1

  return { level, into: total - xpForLevel(level), needed: xpToNext(level) }
}

/**
 * XP earned by one game
 * @param {PlayOutcomeName} outcome - Outcome
 * @return {number} - XP
 */

export const outcomeXp = (outcome: PlayOutcomeName): number => OUTCOME_XP[outcome]

/**
 * XP earned by a whole tournament
 * @param {PlayOutcomeName} outcome - Final outcome
 * @param {number} games - Games played
 * @return {number} - XP
 */

export const tournamentXp = (outcome: PlayOutcomeName, games: number): number =>
  Math.round(OUTCOME_XP[outcome] * (games + PLAY_SETTINGS.tournament.bonusPerGame * (games - 1)))

/**
 * Share of a level already paid
 * @param {PlayLevel} level - Level standing
 * @return {number} - Percent
 */

export const levelShare = ({ into, needed }: PlayLevel): number =>
  needed ? Math.min(100, (into / needed) * 100) : 100
