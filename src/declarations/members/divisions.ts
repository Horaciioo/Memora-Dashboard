import type { FrameTone } from '@/components/elements/display/glyphs/BrandGlyphs'
import { FIXED_DIVISIONS } from '@/declarations/reference/fixed'

/**
 * Escutcheon of one division tier
 * @typedef {Object} DivisionTier
 * @property {number} chevrons - Galons stacked on the shield
 * @property {boolean} hollow - Outline only, not earned yet
 * @property {boolean} double - Second gilt rim
 * @property {FrameTone} tone - Ramp the shield takes
 */

export interface DivisionTier {
  chevrons: number
  hollow: boolean
  double: boolean
  tone: FrameTone
}

/**
 * Tiers from Junior to the last division
 * @type {readonly DivisionTier[]}
 */

export const DIVISION_TIERS: readonly DivisionTier[] = [
  { chevrons: 1, hollow: true, double: false, tone: 'DIVISION_JUNIOR' },
  { chevrons: 1, hollow: false, double: false, tone: 'DIVISION' },
  { chevrons: 2, hollow: false, double: false, tone: 'DIVISION' },
  { chevrons: 3, hollow: false, double: false, tone: 'DIVISION' },
  { chevrons: 4, hollow: false, double: true, tone: 'DIVISION_LEAD' },
]

// Division of a member still in the academy
const JUNIOR_DIVISION = 'Junior'

/**
 * Tier a division wears
 * @param {string} label - Division name
 * @return {number | null} - Index in the tiers, null for a division outside the ladder
 */

export const divisionTier = (label: string): number | null => {
  if (label === JUNIOR_DIVISION) return 0

  const rank = FIXED_DIVISIONS.find((division) => division.name === label)?.rank

  return rank && rank < DIVISION_TIERS.length ? rank : null
}
