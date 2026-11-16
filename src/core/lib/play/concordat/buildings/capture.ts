import { buildingsAt } from '@/core/lib/play/concordat/buildings/rules'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

/**
 * A tile changed hands: its buildings are damaged, or razed when it was a first level
 * @param {ConcordatState} state - Game
 * @param {number} tile - Tile
 * @param {number} from - Previous owner, zero for none
 * @param {number} to - New owner, zero for none
 * @return {void}
 */

export const settleBuildingOnCapture = (
  state: ConcordatState,
  tile: number,
  from: number,
  to: number
): void => {
  const stack = from ? buildingsAt(state, tile) : []
  if (!stack.length) return

  state.isSystemsDirty = true
  for (const building of stack) {
    building.level -= CONCORDAT.buildings.capturedLevelLoss
    if (!to || building.level < 1) {
      state.buildings = state.buildings.filter((other) => other !== building)
    } else {
      building.owner = to
      building.readyAt = state.tick + ticksOf(CONCORDAT.buildings.repairSeconds)
    }
  }
  emit(state, { tick: state.tick, kind: 'built', actor: to, victim: from, tile })
}
