import { buildingById, isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { seaAround, seaPath } from '@/core/lib/play/concordat/navy/path'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatShip, ConcordatState } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatShipKinds,
  ConcordatTies,
} from '@/utils/constants/concordat'

const { navy } = CONCORDAT

// Distance on the grid
const reach = (state: ConcordatState, first: number, second: number): number => {
  const { width } = state.map

  return Math.hypot(
    (first % width) - (second % width),
    Math.floor(first / width) - Math.floor(second / width)
  )
}

/**
 * Health of a warship in hit points
 * @param {ConcordatShip} ship - Warship
 * @return {number} - Hit points
 */

export const hpOf = (ship: ConcordatShip): number => ship.hp ?? navy.warHp

/**
 * Credit a kill to a warship, every few kills it gains a rank that hits harder
 * @param {ConcordatShip} ship - Warship
 * @return {void}
 */

export const addKill = (ship: ConcordatShip): void => {
  ship.kills = (ship.kills ?? 0) + 1
  ship.vet = Math.min(navy.vetMax, Math.floor(ship.kills / navy.vetKills))
}

// Nearest working port of the ship's nation within docking reach
const dockOf = (state: ConcordatState, ship: ConcordatShip) =>
  state.buildings
    .filter(
      (building) =>
        building.owner === ship.owner &&
        building.kind === ConcordatBuildingKinds.Port &&
        isWorking(building, state.tick) &&
        reach(state, building.tile, ship.tile) <= navy.dockRadius
    )
    .at(0)

// A damaged warship turns for its home port, or any port of its nation
const headHome = (state: ConcordatState, ship: ConcordatShip): void => {
  const home =
    buildingById(state, ship.port) ??
    state.buildings.find(
      (building) => building.owner === ship.owner && building.kind === ConcordatBuildingKinds.Port
    )
  if (!home) return

  const way = seaPath(state.map, [ship.tile], seaAround(state.map, home.tile))
  if (!way) return

  ship.path = way.slice(1)
  ship.progress = 0
  ship.isRetreating = true
}

// Nearest enemy warship in gun range
const targetOf = (state: ConcordatState, ship: ConcordatShip): ConcordatShip | null => {
  let best: ConcordatShip | null = null
  let bestReach = Infinity
  for (const other of state.ships) {
    if (other.kind !== ConcordatShipKinds.War || other.owner === ship.owner) continue
    // No treaty means war
    const tie = tieKindOf(state, ship.owner, other.owner)
    if (tie === ConcordatTies.Alliance || tie === ConcordatTies.Peace) continue

    const distance = reach(state, ship.tile, other.tile)
    if (distance <= navy.duelRadius && distance < bestReach) {
      best = other
      bestReach = distance
    }
  }

  return best
}

/**
 * Warships once a second: heal at the dock, run home when hurt, shell the nearest enemy warship
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runWarships = (state: ConcordatState): void => {
  if (state.tick % CONCORDAT_TICKS_PER_SECOND !== 0) return

  const sunk: ConcordatShip[] = []
  for (const ship of state.ships) {
    if (ship.kind !== ConcordatShipKinds.War || sunk.includes(ship)) continue

    // Healing in port, back to sea once nearly whole
    if (dockOf(state, ship) && hpOf(ship) < navy.warHp) {
      ship.hp = Math.min(navy.warHp, hpOf(ship) + navy.healPerSecond * state.speed)
      state.isSystemsDirty = true
    }
    if (ship.isRetreating && hpOf(ship) >= navy.warHp * 0.95) ship.isRetreating = false
    if (!ship.isRetreating && hpOf(ship) <= navy.warHp * navy.retreatBelow) headHome(state, ship)
    if (ship.isRetreating || (ship.coolAt ?? 0) > state.tick) continue

    const foe = targetOf(state, ship)
    if (!foe || sunk.includes(foe)) continue

    foe.hp = hpOf(foe) - navy.shellDamage * (1 + navy.vetBonus * (ship.vet ?? 0))
    ship.coolAt = state.tick + ticksOf(navy.shellSeconds)
    state.isSystemsDirty = true
    if (foe.hp <= 0) {
      sunk.push(foe)
      addKill(ship)
      emit(state, {
        tick: state.tick,
        kind: 'warshipSunk',
        actor: ship.owner,
        victim: foe.owner,
        tile: foe.tile,
      })
    }
  }
  if (sunk.length) state.ships = state.ships.filter((ship) => !sunk.includes(ship))
}
