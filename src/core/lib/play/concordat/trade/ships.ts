import { isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { isEmbargoed } from '@/core/lib/play/concordat/diplomacy/embargo'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { isCondemned } from '@/core/lib/play/concordat/diplomacy/trust'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { distanceBetween } from '@/core/lib/play/concordat/map'
import { seaAround, seaPath } from '@/core/lib/play/concordat/navy/path'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuilding, ConcordatShip, ConcordatState } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatShipKinds,
  ConcordatTies,
} from '@/utils/constants/concordat'

const { ships: cargo } = CONCORDAT.trade

/**
 * Whether cargo may flow between two nations: itself, an ally or a nation at peace, never under an embargo
 * @param {ConcordatState} state - Game
 * @param {number} first - Sender
 * @param {number} second - Receiver
 * @return {boolean} - Allowed
 */

export const canShip = (state: ConcordatState, first: number, second: number): boolean => {
  if (first === second) return true
  if (isEmbargoed(state, first, second)) return false
  const tie = tieKindOf(state, first, second)

  return tie === ConcordatTies.Alliance || tie === ConcordatTies.Peace
}

// Working ports of a living nation
const portsOf = (state: ConcordatState): ConcordatBuilding[] =>
  state.buildings.filter(
    (building) =>
      building.kind === ConcordatBuildingKinds.Port &&
      isWorking(building, state.tick) &&
      state.players[building.owner - 1]?.alive
  )

// Port a cargo ship sails to, none when it is gone or closed to the sender
const destinationOf = (state: ConcordatState, ship: ConcordatShip): ConcordatBuilding | null => {
  const port = state.buildings.find((building) => building.id === ship.dest)
  if (!port || !isWorking(port, state.tick) || !canShip(state, ship.owner, port.owner)) return null

  return port
}

// Gold of one crossing, cut by a condemned party
const cargoGold = (state: ConcordatState, ship: ConcordatShip, receiver: number): number => {
  const home = state.buildings.find((building) => building.id === ship.port)
  const far = state.buildings.find((building) => building.id === ship.dest)
  const length = home && far ? distanceBetween(home.tile, far.tile, state.map.width) : 0
  const gold = Math.min(cargo.goldCap, cargo.goldBase + cargo.goldPerTile * length)
  const isBlamed = isCondemned(state, ship.owner) || isCondemned(state, receiver)

  const ally = receiver === ship.owner ? 1 : 1 + CONCORDAT.trade.allyBonus

  return gold * ally * (isBlamed ? 1 - CONCORDAT.trade.condemnedMalus : 1)
}

// Foe warship close to the ship
const pirateOf = (state: ConcordatState, ship: ConcordatShip): number => {
  const { width } = state.map
  for (const other of state.ships) {
    if (other.kind !== ConcordatShipKinds.War || other.owner === ship.owner) continue
    if (tieKindOf(state, other.owner, ship.owner) !== ConcordatTies.Hostile) continue

    const dx = (other.tile % width) - (ship.tile % width)
    const dy = Math.floor(other.tile / width) - Math.floor(ship.tile / width)
    if (Math.hypot(dx, dy) <= cargo.pirateRadius) return other.owner
  }

  return 0
}

// Ship taken by a pirate: it turns to the nearest port of the captor, false when none can be reached
const seize = (state: ConcordatState, ship: ConcordatShip, pirate: number): boolean => {
  let best: { port: ConcordatBuilding; path: number[] } | null = null
  for (const port of portsOf(state).filter((other) => other.owner === pirate)) {
    const path = seaPath(state.map, [ship.tile], seaAround(state.map, port.tile))
    if (path && (!best || path.length < best.path.length)) best = { port, path }
  }
  if (!best) return false

  const victim = ship.owner
  ship.owner = pirate
  ship.dest = best.port.id
  ship.path = best.path.slice(1)
  ship.progress = 0
  emit(state, { tick: state.tick, kind: 'captured', actor: pirate, victim, tile: ship.tile })
  state.isSystemsDirty = true

  return true
}

/**
 * Advance one cargo ship, pay it on arrival, lose it when the way closes
 * @param {ConcordatState} state - Game
 * @param {ConcordatShip} ship - Cargo ship
 * @return {boolean} - Ship is gone
 */

export const settleCargo = (state: ConcordatState, ship: ConcordatShip): boolean => {
  const port = destinationOf(state, ship)
  const pirate = port ? pirateOf(state, ship) : 0
  if (port && !pirate && ship.path.length) return false

  state.isSystemsDirty = true
  if (!port) return true

  // A foe warship takes the ship and sails it to its own port, the loser gets nothing
  const gold = cargoGold(state, ship, port.owner)
  if (pirate) {
    if (seize(state, ship, pirate)) return false
    state.players[pirate - 1].gold += gold * cargo.captureShare

    return true
  }

  // Both parties are paid, an own port pays once
  state.players[ship.owner - 1].gold += gold
  if (port.owner !== ship.owner) state.players[port.owner - 1].gold += gold * cargo.partnerShare

  return true
}

// Cargo ships already sailing from a port
const sailingFrom = (state: ConcordatState, port: ConcordatBuilding): number =>
  state.ships.filter((ship) => ship.kind === ConcordatShipKinds.Trade && ship.port === port.id)
    .length

// Launch one ship from a port toward a random partner port
const launch = (
  state: ConcordatState,
  port: ConcordatBuilding,
  ports: ConcordatBuilding[]
): void => {
  const partners = ports.filter(
    (other) =>
      other.id !== port.id &&
      canShip(state, port.owner, other.owner) &&
      distanceBetween(port.tile, other.tile, state.map.width) >= cargo.minLength
  )
  if (!partners.length) return

  const target = partners[Math.floor(nextRandom(state) * partners.length)]
  const path = seaPath(
    state.map,
    seaAround(state.map, port.tile),
    seaAround(state.map, target.tile)
  )
  if (!path?.length) return

  state.ships.push({
    id: state.nextId++,
    owner: port.owner,
    kind: ConcordatShipKinds.Trade,
    tile: path[0],
    path: path.slice(1),
    troops: 0,
    landing: -1,
    ttl: 0,
    port: port.id,
    progress: 0,
    dest: target.id,
  })
  state.isSystemsDirty = true
}

/**
 * Ports send cargo ships to their own other ports and to allied ports
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const spawnCargo = (state: ConcordatState): void => {
  if (state.tick % cargo.checkTicks !== 0) return

  const ports = portsOf(state)
  const chance = cargo.checkTicks / ticksOf(cargo.spawnSeconds)
  let left = cargo.maxSpawns
  for (const port of ports) {
    if (left <= 0) break
    if (sailingFrom(state, port) >= cargo.maxPerPort || nextRandom(state) > chance) continue

    const before = state.ships.length
    launch(state, port, ports)
    if (state.ships.length > before) left--
  }
}
