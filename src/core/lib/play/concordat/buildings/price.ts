import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

const { buildings } = CONCORDAT

/**
 * Gold for the next building of a kind, one more base price per one held up to the price cap
 * @param {ConcordatBuildingKind} kind - Kind
 * @param {number} held - Buildings of that kind already owned
 * @return {number} - Gold
 */

export const priceOf = (kind: ConcordatBuildingKind, held: number): number =>
  Math.min(
    buildings.priceCap,
    Math.round(buildings.kinds[kind].cost * (1 + buildings.kinds[kind].step * held))
  )

/**
 * Gold to raise a building one level, follows the price of the next one of its kind
 * @param {ConcordatBuildingKind} kind - Kind
 * @param {number} level - Current level
 * @param {number} held - Buildings of that kind already owned
 * @return {number} - Gold
 */

export const raisePriceOf = (kind: ConcordatBuildingKind, level: number, held: number): number =>
  Math.min(buildings.priceCap, Math.round(priceOf(kind, held) * buildings.upgradeFactor * level))
