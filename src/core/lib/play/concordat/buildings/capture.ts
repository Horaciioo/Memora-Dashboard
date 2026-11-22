import { buildingsAt } from '@/core/lib/play/concordat/buildings/rules'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

/**
 * A tile changed hands: its buildings pass to the new owner whole, after a short repair, or fall when nobody takes it
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
    if (!to) {
      state.buildings = state.buildings.filter((other) => other !== building)
      continue
    }
    building.owner = to
    building.readyAt = state.tick + ticksOf(CONCORDAT.buildings.repairSeconds)
  }
  emit(state, { tick: state.tick, kind: 'built', actor: to, victim: from, tile })
}
