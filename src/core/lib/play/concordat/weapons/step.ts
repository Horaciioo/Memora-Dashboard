import { isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { forEachInDisc, reachOf } from '@/core/lib/play/concordat/sim/area'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { addZone } from '@/core/lib/play/concordat/zones'
import { silosOf, stockCap, weaponsOn } from '@/core/lib/play/concordat/weapons/rules'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState, ConcordatStrike } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatTerrains,
  ConcordatZoneKinds,
} from '@/utils/constants/concordat'

const { weapons } = CONCORDAT

// Share of strikes stopped near the target
const interceptChance = (state: ConcordatState, strike: ConcordatStrike): number => {
  const holder = state.owner[strike.tile]
  if (!holder) return 0

  const posts = state.buildings.filter(
    (building) =>
      building.owner === holder &&
      building.kind === ConcordatBuildingKinds.Fortress &&
      isWorking(building, state.tick) &&
      reachOf(building.tile, strike.tile, state.map.width) <= weapons.interceptRadius
  ).length

  return Math.min(
    weapons.interceptCap,
    posts * weapons.interceptPerFortress + state.effects[holder - 1].intercept
  )
}

// Damage of a landed strike
const detonate = (state: ConcordatState, strike: ConcordatStrike): void => {
  const { width, height, terrain } = state.map
  const radius = weapons.radius[strike.kind]
  const hits = new Map<number, number>()

  forEachInDisc({ width, height, tile: strike.tile, radius }, (tile) => {
    const holder = state.owner[tile]
    if (holder && terrain[tile] !== ConcordatTerrains.Sea)
      hits.set(holder, (hits.get(holder) ?? 0) + 1)
  })

  // Troops are emptied from the tiles hit, nothing is conquered
  let main = 0
  for (const [holder, count] of hits) {
    const nation = state.players[holder - 1]
    const loss = Math.min(weapons.maxLoss, (count / Math.max(1, nation.tiles)) * weapons.troopLoss)
    nation.troops *= 1 - loss
    nation.stability = Math.max(0, nation.stability - weapons.impactStability)
    if (count > (hits.get(main) ?? 0)) main = holder
  }

  // Buildings in the disc fall, ships at sea go down
  const reaches = (tile: number): boolean => reachOf(tile, strike.tile, width) <= radius
  state.buildings = state.buildings.filter((building) => !reaches(building.tile))
  state.ships = state.ships.filter((ship) => !reaches(ship.tile))

  addZone(state, {
    kind: ConcordatZoneKinds.Fallout,
    tile: strike.tile,
    radius,
    until: state.tick + ticksOf(weapons.falloutSeconds),
  })
  emit(state, {
    tick: state.tick,
    kind: 'impact',
    actor: strike.owner,
    victim: main,
    tile: strike.tile,
  })
}

// Strikes that reach their target
const land = (state: ConcordatState): void => {
  const due = state.strikes.filter((strike) => strike.impactAt <= state.tick)
  if (!due.length) return

  state.strikes = state.strikes.filter((strike) => strike.impactAt > state.tick)
  state.isSystemsDirty = true
  for (const strike of due) {
    if (nextRandom(state) < interceptChance(state, strike)) {
      emit(state, {
        tick: state.tick,
        kind: 'intercepted',
        actor: strike.owner,
        victim: state.owner[strike.tile],
        tile: strike.tile,
      })
    } else {
      detonate(state, strike)
    }
  }
}

// Silos fill their stock slowly
const restock = (state: ConcordatState): void => {
  for (const player of state.players) {
    if (!player.alive) continue

    const arms = state.arms[player.id - 1]
    const cap = stockCap(state, player.id)
    arms.missiles = Math.min(arms.missiles, cap)
    if (arms.missiles >= cap || !silosOf(state, player.id).length) {
      arms.nextAt = 0
      continue
    }
    if (!arms.nextAt) arms.nextAt = state.tick + ticksOf(weapons.stockSeconds)
    if (arms.nextAt <= state.tick) {
      arms.missiles++
      arms.nextAt = 0
      state.isSystemsDirty = true
    }
  }
}

/**
 * Add the upkeep of the stock to the effects
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const applyWeaponUpkeep = (state: ConcordatState): void => {
  for (const player of state.players) {
    state.effects[player.id - 1].upkeep += state.arms[player.id - 1].missiles * weapons.stockUpkeep
  }
}

/**
 * Weapons phase of a tick
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runWeapons = (state: ConcordatState): void => {
  if (!weaponsOn(state)) return

  land(state)
  if (state.tick % CONCORDAT_TICKS_PER_SECOND === 0) restock(state)
}
