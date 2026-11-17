import { isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { distanceBetween } from '@/core/lib/play/concordat/map'
import { grossOf } from '@/core/lib/play/concordat/sim/economy'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { canShip } from '@/core/lib/play/concordat/trade/ships'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBuilding, ConcordatShip, ConcordatState } from '@/types/concordat'
import {
  ConcordatBuildingKinds,
  ConcordatShipKinds,
  ConcordatTerrains,
  ConcordatTies,
} from '@/utils/constants/concordat'

const { trains } = CONCORDAT.trade

// Tiles of a straight line from one tile to another, the start left out
const lineBetween = (width: number, from: number, to: number): number[] => {
  let x = from % width
  let y = Math.floor(from / width)
  const endX = to % width
  const endY = Math.floor(to / width)
  const stepX = Math.sign(endX - x)
  const stepY = Math.sign(endY - y)
  const dx = Math.abs(endX - x)
  const dy = -Math.abs(endY - y)
  let error = dx + dy
  const tiles: number[] = []

  while (x !== endX || y !== endY) {
    const double = 2 * error
    if (double >= dy) {
      error += dy
      x += stepX
    }
    if (double <= dx) {
      error += dx
      y += stepY
    }
    tiles.push(y * width + x)
  }

  return tiles
}

// Rails never cross water: every tile of the line is land
const isRailable = (state: ConcordatState, line: number[]): boolean =>
  line.every((tile) => state.map.terrain[tile] !== ConcordatTerrains.Sea)

// Trains already running from a factory
const runningFrom = (state: ConcordatState, factory: ConcordatBuilding): number =>
  state.ships.filter((ship) => ship.kind === ConcordatShipKinds.Train && ship.port === factory.id)
    .length

// Station the train goes to: a market of mine, an ally or a nation at peace, within reach by rail
const stationFor = (
  state: ConcordatState,
  factory: ConcordatBuilding
): { station: ConcordatBuilding; line: number[] } | null => {
  const { width } = state.map
  const stations = state.buildings.filter(
    (building) =>
      building.kind === ConcordatBuildingKinds.Market &&
      isWorking(building, state.tick) &&
      state.players[building.owner - 1]?.alive &&
      canShip(state, factory.owner, building.owner) &&
      distanceBetween(factory.tile, building.tile, width) <= trains.range &&
      building.tile !== factory.tile
  )
  // A few tries at random, a line over water is dropped
  for (let attempt = 0; attempt < trains.stationStep && stations.length; attempt++) {
    const station = stations[Math.floor(nextRandom(state) * stations.length)]
    const line = lineBetween(width, factory.tile, station.tile)
    if (isRailable(state, line)) return { station, line }
  }

  return null
}

/**
 * Factories send trains to the markets within reach, as many as the level allows
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const spawnTrains = (state: ConcordatState): void => {
  if (state.tick % ticksOf(trains.checkSeconds) !== 0) return

  for (const factory of state.buildings) {
    if (factory.kind !== ConcordatBuildingKinds.Factory || !isWorking(factory, state.tick)) continue
    if (!state.players[factory.owner - 1]?.alive) continue
    if (runningFrom(state, factory) >= factory.level * trains.maxPerLevel) continue

    const goal = stationFor(state, factory)
    if (!goal) continue

    state.ships.push({
      id: state.nextId++,
      owner: factory.owner,
      kind: ConcordatShipKinds.Train,
      tile: factory.tile,
      path: goal.line,
      troops: 0,
      landing: -1,
      ttl: 0,
      port: factory.id,
      progress: 0,
      dest: goal.station.id,
    })
    state.isSystemsDirty = true
  }
}

/**
 * Pay a train at its station, drop it when the station is gone
 * @param {ConcordatState} state - Game
 * @param {ConcordatShip} ship - Train
 * @return {boolean} - Train is gone
 */

export const settleTrain = (state: ConcordatState, ship: ConcordatShip): boolean => {
  const station = state.buildings.find((building) => building.id === ship.dest)
  const isOpen =
    station && isWorking(station, state.tick) && canShip(state, ship.owner, station.owner)
  if (!isOpen) {
    state.isSystemsDirty = true

    return true
  }
  if (ship.path.length) return false

  // Worth a few seconds of the owner's income, friends pay more
  const tie = tieKindOf(state, ship.owner, station.owner)
  const kind =
    station.owner === ship.owner ? 'self' : tie === ConcordatTies.Alliance ? 'ally' : 'other'
  const owner = state.players[ship.owner - 1]
  const gold = Math.max(trains.minGold, grossOf(owner) * trains.seconds[kind])
  owner.gold += gold
  if (station.owner !== ship.owner) {
    state.players[station.owner - 1].gold += gold * trains.partnerShare
  }
  state.isSystemsDirty = true

  return true
}
