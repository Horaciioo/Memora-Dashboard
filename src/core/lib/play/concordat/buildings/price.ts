import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

const { buildings } = CONCORDAT

/**
 * Gold for the next building of a kind, grows with each one held up to the price cap
 * @param {ConcordatBuildingKind} kind - Kind
 * @param {number} held - Buildings of that kind already owned
 * @return {number} - Gold
 */

export const priceOf = (kind: ConcordatBuildingKind, held: number): number =>
  Math.min(
    buildings.priceCap,
    Math.round(buildings.kinds[kind].cost * buildings.kinds[kind].growth ** held)
  )

/**
 * Gold to raise a building one level, held under the price cap
 * @param {ConcordatBuildingKind} kind - Kind
 * @param {number} level - Current level
 * @return {number} - Gold
 */

export const raisePriceOf = (kind: ConcordatBuildingKind, level: number): number =>
  Math.min(
    buildings.priceCap,
    Math.round(buildings.kinds[kind].cost * buildings.upgradeFactor * level)
  )
