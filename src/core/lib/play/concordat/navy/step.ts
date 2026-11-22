import { addKill, runWarships } from '@/core/lib/play/concordat/navy/combat'
import { escortsOf, foesOf, landShip } from '@/core/lib/play/concordat/navy/land'
import { settleCargo, warshipsOf } from '@/core/lib/play/concordat/trade/ships'
import { settleTrain } from '@/core/lib/play/concordat/trade/trains'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { TICK_SECONDS } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatShip, ConcordatState } from '@/types/concordat'
import { ConcordatShipKinds } from '@/utils/constants/concordat'

const { navy } = CONCORDAT

// Distance on the grid
const reach = (state: ConcordatState, first: number, second: number): number => {
  const { width } = state.map

  return Math.hypot(
    (first % width) - (second % width),
    Math.floor(first / width) - Math.floor(second / width)
  )
}

// Advance along the path
const sailOn = (state: ConcordatState, ship: ConcordatShip): void => {
  if (!ship.path.length) return

  const speeds = {
    [ConcordatShipKinds.War]: navy.warSpeed,
    [ConcordatShipKinds.Transport]: navy.transportSpeed,
    [ConcordatShipKinds.Trade]: CONCORDAT.trade.ships.speed,
    [ConcordatShipKinds.Train]: CONCORDAT.trade.trains.speed,
  }
  const speed = speeds[ship.kind]
  const boost = 1 + state.effects[ship.owner - 1].shipSpeed
  ship.progress += speed * boost * TICK_SECONDS * state.speed
  while (ship.progress >= 1 && ship.path.length) {
    ship.tile = ship.path.shift() as number
    ship.progress -= 1
  }
}

// A transport near a foe warship without an escort is lost
const isIntercepted = (state: ConcordatState, ship: ConcordatShip): boolean => {
  const foes = foesOf(state, ship)
  const guards = escortsOf(state, ship.owner)
  const warships = warshipsOf(state)

  const isGuarded = warships.some(
    (other) =>
      guards.includes(other.owner) && reach(state, other.tile, ship.tile) <= navy.escortRadius
  )
  if (isGuarded) return false

  return warships.some(
    (other) =>
      foes.includes(other.owner) && reach(state, other.tile, ship.tile) <= navy.interceptRadius
  )
}

/**
 * Navy phase of a tick: sail, intercept, land
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runNavy = (state: ConcordatState): void => {
  if (!state.ships.length) return

  for (const ship of [...state.ships]) {
    sailOn(state, ship)
    if (ship.kind === ConcordatShipKinds.Trade) {
      if (settleCargo(state, ship)) state.ships = state.ships.filter((other) => other !== ship)
      continue
    }
    if (ship.kind === ConcordatShipKinds.Train) {
      if (settleTrain(state, ship)) state.ships = state.ships.filter((other) => other !== ship)
      continue
    }
    if (ship.kind !== ConcordatShipKinds.Transport) continue

    if (isIntercepted(state, ship)) {
      const hunter = state.ships.find(
        (other) =>
          other.kind === ConcordatShipKinds.War &&
          other.owner !== ship.owner &&
          reach(state, other.tile, ship.tile) <= navy.interceptRadius
      )
      if (hunter) addKill(hunter)
      state.players[ship.owner - 1].troops += ship.troops * (1 - navy.interceptLoss)
      emit(state, { tick: state.tick, kind: 'sunk', actor: 0, victim: ship.owner, tile: ship.tile })
      state.ships = state.ships.filter((other) => other !== ship)
      state.isSystemsDirty = true
    } else if (!ship.path.length) {
      landShip(state, ship)
      state.ships = state.ships.filter((other) => other !== ship)
      state.isSystemsDirty = true
    }
  }
  runWarships(state)
}
