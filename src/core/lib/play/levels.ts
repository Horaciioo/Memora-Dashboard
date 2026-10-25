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

/**
 * XP from one level to the next
 * @param {number} level - Starting level
 * @return {number} - XP needed
 */

export const xpToNext = (level: number): number =>
  Math.round(PLAY_SETTINGS.levels.base * level ** PLAY_SETTINGS.levels.growth)

/**
 * Total XP opening a level
 * @param {number} level - Target level
 * @return {number} - XP from zero
 */

export const xpForLevel = (level: number): number =>
  Array.from({ length: Math.min(level, PLAY_SETTINGS.levels.max) - 1 }, (_, index) =>
    xpToNext(index + 1)
  ).reduce((sum, step) => sum + step, 0)

/**
 * Level reached with some XP
 * @param {number} xp - Total XP
 * @return {PlayLevel} - Level standing
 */

export const levelOf = (xp: number): PlayLevel => {
  let level = 1
  let into = Math.max(0, xp)

  // Climb while the next step is paid
  while (level < PLAY_SETTINGS.levels.max && into >= xpToNext(level)) {
    into -= xpToNext(level)
    level += 1
  }

  return { level, into, needed: level < PLAY_SETTINGS.levels.max ? xpToNext(level) : null }
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
