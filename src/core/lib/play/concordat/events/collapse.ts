import { emit } from '@/core/lib/play/concordat/sim/emit'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

const { events } = CONCORDAT

// Provinces held, the smallest hold first
const smallestHeld = (state: ConcordatState, holder: number): number[] => {
  const stride = state.map.provinces.length + 1

  return state.map.provinces
    .map((province) => ({
      id: province.id,
      held: state.provinceCounts[holder * stride + province.id],
    }))
    .filter((entry) => entry.held > 0)
    .sort((first, second) => first.held - second.held || first.id - second.id)
    .map((entry) => entry.id)
}

// A nation breaks into neutral provinces, never past the cap
const crumble = (state: ConcordatState, holder: number): void => {
  const nation = state.players[holder - 1]
  const stride = state.map.provinces.length + 1
  let budget = Math.floor(nation.tiles * events.maxLossShare)
  const freed = new Set<number>()

  for (const province of smallestHeld(state, holder)) {
    const held = state.provinceCounts[holder * stride + province]
    if (held > budget) break

    budget -= held
    freed.add(province)
  }
  for (let tile = 0; tile < state.owner.length; tile++) {
    if (state.owner[tile] === holder && freed.has(state.map.province[tile])) {
      transferTile(state, tile, 0)
    }
  }
  nation.stability = events.collapseRestore
  emit(state, { tick: state.tick, kind: 'collapse', actor: 0, victim: holder, tile: freed.size })
}

/**
 * A nation without capital and without calm splits, the gauge warns first
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runCollapse = (state: ConcordatState): void => {
  for (const nation of state.players) {
    if (!nation.alive) continue

    const isFragile = nation.capital < 0 && nation.stability <= events.collapseWarn
    const warned = state.world.warned.includes(nation.id)
    if (!isFragile) {
      if (warned) state.world.warned = state.world.warned.filter((id) => id !== nation.id)
      continue
    }
    if (!warned) {
      state.world.warned.push(nation.id)
      emit(state, { tick: state.tick, kind: 'announce', actor: 5, victim: nation.id, tile: -1 })
    }
    if (nation.stability <= events.collapseBelow) crumble(state, nation.id)
  }
}
