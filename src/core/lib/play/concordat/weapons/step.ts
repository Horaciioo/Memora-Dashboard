import { addScar } from '@/core/lib/play/concordat/air/scars'
import { isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { forEachInDisc, reachOf } from '@/core/lib/play/concordat/sim/area'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { addZone } from '@/core/lib/play/concordat/zones'
import { silosOf, stockCap, weaponsOn } from '@/core/lib/play/concordat/weapons/rules'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatBuilding, ConcordatState, ConcordatStrike } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatScarKinds,
  ConcordatTerrains,
  ConcordatZoneKinds,
} from '@/utils/constants/concordat'

const { weapons, air } = CONCORDAT

// Share of strikes stopped by research
const interceptChance = (state: ConcordatState, strike: ConcordatStrike): number => {
  const holder = state.owner[strike.tile]
  if (!holder || strike.kind === 'shell') return 0

  // Fortresses stop no strike, only research and SAM batteries do
  return Math.min(weapons.interceptCap, state.effects[holder - 1].intercept)
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
  const factor = weapons.lossFactor[strike.kind]
  for (const [holder, count] of hits) {
    const nation = state.players[holder - 1]
    const loss = Math.min(
      weapons.maxLoss,
      (count / Math.max(1, nation.tiles)) * weapons.troopLoss * factor
    )
    nation.troops *= 1 - loss
    nation.stability = Math.max(0, nation.stability - weapons.impactStability * factor)
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
    until: state.tick + ticksOf(weapons.falloutSeconds * weapons.falloutFactor[strike.kind]),
  })
  addScar(state, strike.tile, radius, ConcordatScarKinds.Blast)
  emit(state, {
    tick: state.tick,
    kind: 'impact',
    actor: strike.owner,
    victim: main,
    tile: strike.tile,
  })
}

// Strikes that reach their target or are shot down on the way
const land = (state: ConcordatState): void => {
  const due = state.strikes.filter(
    (strike) => strike.impactAt <= state.tick || (strike.killAt && strike.killAt <= state.tick)
  )
  if (!due.length) return

  state.strikes = state.strikes.filter((strike) => !due.includes(strike))
  state.isSystemsDirty = true
  for (const strike of due) {
    const isShot = Boolean(strike.killAt)
    if (isShot || nextRandom(state) < interceptChance(state, strike)) {
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

// Chance a battery of this level stops the strike
const samChance = (level: number, strike: ConcordatStrike): number => {
  const base = air.samMissile[Math.min(level, air.samMissile.length) - 1]

  return strike.kind === 'heavy' ? base * air.samHeavy : base
}

// Nearest ready anti-missile battery of a nation that covers a tile
const readySam = (
  state: ConcordatState,
  holder: number,
  tile: number
): ConcordatBuilding | null => {
  let best: ConcordatBuilding | null = null
  let bestReach = Infinity
  for (const building of state.buildings) {
    if (
      building.owner !== holder ||
      building.kind !== ConcordatBuildingKinds.Sam ||
      !isWorking(building, state.tick) ||
      (building.coolAt ?? 0) > state.tick
    )
      continue
    const range = CONCORDAT.buildings.kinds.sam.levels[building.level - 1].radius
    const reach = reachOf(building.tile, tile, state.map.width)
    if (reach <= range && reach < bestReach) {
      best = building
      bestReach = reach
    }
  }

  return best
}

// Anti-missile batteries fire on the strikes about to land on their ground
const defend = (state: ConcordatState): void => {
  const lead = ticksOf(air.samLeadSeconds)
  const flight = ticksOf(air.interceptSeconds)

  for (const strike of state.strikes) {
    if (strike.kind === 'shell' || strike.killAt || strike.impactAt - state.tick > lead) continue
    const holder = state.owner[strike.tile]
    const sam = holder ? readySam(state, holder, strike.tile) : null
    if (!sam) continue

    sam.coolAt =
      state.tick + ticksOf(air.samCooldown[Math.min(sam.level, air.samCooldown.length) - 1])
    strike.by = sam.tile
    strike.shotAt = state.tick
    state.isSystemsDirty = true
    if (nextRandom(state) < samChance(sam.level, strike))
      strike.killAt = Math.min(state.tick + flight, strike.impactAt)
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

  if (state.tick % CONCORDAT_TICKS_PER_SECOND === 0) defend(state)
  land(state)
  if (state.tick % CONCORDAT_TICKS_PER_SECOND === 0) restock(state)
}
