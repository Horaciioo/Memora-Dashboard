import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import type { SanctionOffenseCard } from '@/types/sanctions'
import type { SanctionGravityName } from '@/utils/constants/moderation'
import { foldText } from '@/utils/format/strings'

/**
 * Offences of one gravity
 * @typedef {Object} OffenseGroup
 * @property {SanctionGravityName} gravity - Gravity shared
 * @property {SanctionOffenseCard[]} offenses - Offences, panel order
 */

export interface OffenseGroup {
  gravity: SanctionGravityName
  offenses: SanctionOffenseCard[]
}

/**
 * Offences matching a search, heaviest gravity first
 * @param {SanctionOffenseCard[]} offenses - Panel offences
 * @param {string} search - Typed search
 * @return {OffenseGroup[]} - Non empty groups
 */

export const groupOffenses = (offenses: SanctionOffenseCard[], search: string): OffenseGroup[] => {
  const needle = foldText(search.trim())
  const kept = offenses.filter((offense) => !needle || foldText(offense.name).includes(needle))
  const byGravity = Map.groupBy(kept, (offense) => offense.gravity)

  return SANCTION_GRAVITY_REGISTRY.keys
    .toSorted(
      (left, right) =>
        SANCTION_GRAVITY_REGISTRY.get(right).rank - SANCTION_GRAVITY_REGISTRY.get(left).rank
    )
    .flatMap((gravity) => {
      const entries = byGravity.get(gravity)

      return entries ? [{ gravity, offenses: entries }] : []
    })
}
