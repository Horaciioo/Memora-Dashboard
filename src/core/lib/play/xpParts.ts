import { PLAY_SETTINGS } from '@/declarations/play/settings'
import { PlayXpParts } from '@/declarations/play/xp'
import type { PlayXpPartName } from '@/declarations/play/xp'
import { outcomeXp } from '@/core/lib/play/levels'
import { PlayOutcomes } from '@/utils/constants/play'
import type { PlayOutcomeName } from '@/utils/constants/play'
import type { PlayXpPart } from '@/types/play'

/**
 * Inputs of the XP a player earns from one game
 * @typedef {Object} XpPartsInput
 * @property {PlayOutcomeName} outcome - Result
 * @property {boolean} isFirstGame - First game on this title
 * @property {boolean} isFirstWin - First win on this title
 * @property {number} winnerFactor - Winner multiplier of the game
 * @property {number} botRatio - Share kept beside bots, 1 without
 */

export interface XpPartsInput {
  outcome: PlayOutcomeName
  isFirstGame: boolean
  isFirstWin: boolean
  winnerFactor: number
  botRatio: number
}

/**
 * XP of one game cut into the lines shown at the end, summing to what is paid
 * @param {XpPartsInput} input - Game result
 * @return {PlayXpPart[]} - Lines
 */

export const xpPartsOf = ({
  outcome,
  isFirstGame,
  isFirstWin,
  winnerFactor,
  botRatio,
}: XpPartsInput): PlayXpPart[] => {
  const played = outcomeXp(PlayOutcomes.Loss)
  const total = outcomeXp(outcome)
  const parts: PlayXpPart[] = [{ key: PlayXpParts.Played, xp: Math.min(played, total) }]
  if (total > played) {
    parts.push({
      key: outcome === PlayOutcomes.Win ? PlayXpParts.Win : PlayXpParts.Draw,
      xp: total - played,
    })
  }

  // Each factor adds its own share to what is already earned
  let running = total
  const scale = (key: PlayXpPartName, factor: number) => {
    const delta = Math.round(running * factor) - running
    if (!delta) return
    parts.push({ key, xp: delta })
    running += delta
  }
  if (isFirstGame) scale(PlayXpParts.FirstGame, PLAY_SETTINGS.xp.firstGameMultiplier)
  if (outcome === PlayOutcomes.Win) {
    scale(PlayXpParts.Mode, winnerFactor)
    if (isFirstWin) scale(PlayXpParts.FirstWin, 1 + PLAY_SETTINGS.xp.firstWinBonus)
  }
  scale(PlayXpParts.Bots, botRatio)

  return parts
}
