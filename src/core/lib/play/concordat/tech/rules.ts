import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { CONCORDAT_TECH_ORDER } from '@/utils/constants/concordat'
import type { ConcordatTechPath } from '@/utils/constants/concordat'

const { tech } = CONCORDAT

/**
 * Effects of one tier, keys left out are zero
 * @typedef {Object} ConcordatTier
 */

export interface ConcordatTier {
  cost: number
  seconds: number
  income?: number
  cap?: number
  growth?: number
  defense?: number
  intercept?: number
  shipSpeed?: number
  ships?: number
  calm?: number
  trustGain?: number
  blockade?: number
  upkeepCut?: number
  feint?: number
}

/**
 * Tiers of a path, cheapest first
 * @param {ConcordatTechPath} path - Path
 * @return {ConcordatTier[]} - Tiers
 */

export const tiersOf = (path: ConcordatTechPath): ConcordatTier[] =>
  (tech.paths as Record<ConcordatTechPath, { tiers: ConcordatTier[] }>)[path].tiers

/**
 * Tier a nation has reached on a path
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {ConcordatTechPath} path - Path
 * @return {number} - Tier, zero for none
 */

export const levelOf = (state: ConcordatState, playerId: number, path: ConcordatTechPath): number =>
  state.techs[playerId - 1]?.levels[CONCORDAT_TECH_ORDER.indexOf(path)] ?? 0

/**
 * Gold for the next tier, dearer once another path is deep
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {ConcordatTechPath} path - Path
 * @return {number} - Gold, zero when the path is complete
 */

export const researchCost = (
  state: ConcordatState,
  playerId: number,
  path: ConcordatTechPath
): number => {
  const next = tiersOf(path)[levelOf(state, playerId, path)]
  if (!next) return 0

  const isScattered = CONCORDAT_TECH_ORDER.some(
    (other) => other !== path && levelOf(state, playerId, other) >= tech.specialiseAt
  )

  return Math.round(next.cost * (isScattered ? 1 + tech.surcharge : 1))
}

/**
 * Why a research is refused, null when it can start
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {ConcordatTechPath} path - Path
 * @return {string | null} - Reason
 */

export const researchRefusal = (
  state: ConcordatState,
  playerId: number,
  path: ConcordatTechPath
): string | null => {
  if (!CONCORDAT.features.tech) return 'featureOff'
  if (!CONCORDAT_TECH_ORDER.includes(path)) return 'badPath'

  const mine = state.techs[playerId - 1]
  if (mine.path >= 0) return 'researching'
  if (levelOf(state, playerId, path) >= tiersOf(path).length) return 'pathDone'
  if (
    state.players[playerId - 1].provincesHeld < CONCORDAT.merit.tech[levelOf(state, playerId, path)]
  )
    return 'needsZones'

  return state.players[playerId - 1].gold < researchCost(state, playerId, path) ? 'noGold' : null
}
