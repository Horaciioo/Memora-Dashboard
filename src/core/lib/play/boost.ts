import { PLAY_GROUP_QUEST_BOOST } from '@/declarations/play/groupQuests'
import { PlayXpParts } from '@/declarations/play/xp'
import type { PlayXpPartName } from '@/declarations/play/xp'
import type { PlayConfigView } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Extra XP paid on a game
 * @typedef {Object} PlayBoost
 * @property {PlayXpPartName} key - Line shown at the end
 * @property {number} percent - Extra share, 30 for +30 %
 */

export interface PlayBoost {
  key: PlayXpPartName
  percent: number
}

/**
 * Boost switched on and not yet ended
 * @param {boolean} isOn - Switch
 * @param {number} percent - Extra share
 * @param {string | null} until - End, none when open
 * @param {Date} now - Moment asked
 * @return {boolean}
 */

export const isBoostLive = (isOn: boolean, percent: number, until: string | null, now: Date) =>
  isOn && percent > 0 && (until === null || new Date(until) > now)

/**
 * Game is on the banner
 * @param {PlayConfigView} config - Settings
 * @param {PlayGameName} game - Game
 * @return {boolean}
 */

export const isFeatured = (config: PlayConfigView, game: PlayGameName) =>
  config.featuredGames.includes(game)

/**
 * Boosts a game earns now
 * @param {PlayConfigView} config - Settings
 * @param {PlayGameName} game - Game
 * @param {Date} [now] - Moment asked
 * @return {PlayBoost[]} - Featured first, then the global one
 */

export const boostsOf = (config: PlayConfigView, game: PlayGameName, now = new Date()) => {
  const boosts: PlayBoost[] = []
  const { featuredBoostOn, featuredBoostPercent, featuredBoostUntil } = config
  const { globalBoostOn, globalBoostPercent, globalBoostUntil } = config

  if (
    isFeatured(config, game) &&
    isBoostLive(featuredBoostOn, featuredBoostPercent, featuredBoostUntil, now)
  ) {
    boosts.push({ key: PlayXpParts.Featured, percent: featuredBoostPercent })
  }
  if (isBoostLive(globalBoostOn, globalBoostPercent, globalBoostUntil, now)) {
    boosts.push({ key: PlayXpParts.Event, percent: globalBoostPercent })
  }

  return boosts
}

/**
 * Total extra share a game earns now, for the badge
 * @param {PlayConfigView} config - Settings
 * @param {PlayGameName} game - Game
 * @param {Date} [now] - Moment asked
 * @return {number} - Percent, 0 without boost
 */

export const boostPercentOf = (config: PlayConfigView, game: PlayGameName, now = new Date()) =>
  boostsOf(config, game, now).reduce((sum, boost) => sum + boost.percent, 0)

/**
 * Boost a finished group quest gives a player
 * @param {Date | null} until - End of the boost, null when none
 * @param {Date} [now] - Moment asked
 * @return {PlayBoost | null} - Boost, null when ended or never earned
 */

export const questBoostOf = (until: Date | null, now = new Date()): PlayBoost | null =>
  until && until > now ? { key: PlayXpParts.Quest, percent: PLAY_GROUP_QUEST_BOOST.percent } : null
