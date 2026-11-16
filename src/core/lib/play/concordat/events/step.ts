import { runCollapse } from '@/core/lib/play/concordat/events/collapse'
import { eventsOn } from '@/core/lib/play/concordat/events/rules'
import { announceShock, applyShock, drawShock } from '@/core/lib/play/concordat/events/shocks'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { applyZoneMalus, pruneZones } from '@/core/lib/play/concordat/zones'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { CONCORDAT_WORLD_ORDER, ConcordatWorldKinds } from '@/utils/constants/concordat'

const { events } = CONCORDAT

// Wait before the next draw, four to six minutes by the game seed
const pause = (state: ConcordatState): number =>
  ticksOf((events.minMinutes + nextRandom(state) * (events.maxMinutes - events.minMinutes)) * 60)

/**
 * Income factors and marked ground of this tick, added to the effects
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const applyWorldEffects = (state: ConcordatState): void => {
  const active = state.world.active
  if (active && state.tick >= active.startsAt) {
    for (const target of active.targets) {
      if (active.kind === ConcordatWorldKinds.Crisis)
        state.effects[target - 1].income -= events.crisisCut
      if (active.kind === ConcordatWorldKinds.Harvest)
        state.effects[target - 1].income += events.harvestBonus
    }
  }
  applyZoneMalus(state)
}

/**
 * World phase of a tick: draw, announce, apply, end, collapse
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runWorld = (state: ConcordatState): void => {
  if (state.tick % CONCORDAT_TICKS_PER_SECOND !== 0) return

  pruneZones(state)
  if (!eventsOn(state)) return

  const world = state.world
  runCollapse(state)
  if (!world.nextAt) world.nextAt = state.tick + ticksOf(events.firstMinutes * 60)

  const active = world.active
  if (active) {
    if (!active.isApplied && state.tick >= active.startsAt) applyShock(state, active)
    if (state.tick >= active.endsAt) {
      emit(state, {
        tick: state.tick,
        kind: 'worldEnd',
        actor: CONCORDAT_WORLD_ORDER.indexOf(active.kind),
        victim: active.targets[0] ?? 0,
        tile: active.tile,
      })
      world.active = null
      state.isSystemsDirty = true
    }

    return
  }
  if (state.tick < world.nextAt) return

  const draw = drawShock(state)
  world.nextAt = state.tick + pause(state)
  if (!draw) return

  world.active = draw
  state.isSystemsDirty = true
  announceShock(state, draw)
}
