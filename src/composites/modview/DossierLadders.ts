import type { PanelMemory } from '@/core/lib/modview/commands'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'

export interface DossierLadder {
  offense: SanctionOffenseCard
  applied: number[]
}

/**
 * Ladders a viewer climbed
 * @param {PanelMemory[string] | undefined} memory - Rungs applied
 * @param {SanctionPanelView | null} panel - Sanction panel
 * @return {DossierLadder[]} - Heaviest first
 */

export const climbedLadders = (
  memory: PanelMemory[string] | undefined,
  panel: SanctionPanelView | null
): DossierLadder[] =>
  Object.entries(memory ?? {})
    .flatMap(([offenseId, applied]) => {
      const offense = panel?.offenses.find((entry) => entry.id === offenseId)

      return offense && applied.length > 0 ? [{ offense, applied }] : []
    })
    .sort((left, right) => Math.max(...right.applied) - Math.max(...left.applied))
