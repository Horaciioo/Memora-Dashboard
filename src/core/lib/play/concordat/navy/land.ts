import { fortressBonus } from '@/core/lib/play/concordat/buildings/effects'
import { alliesOf, hasTreaty } from '@/core/lib/play/concordat/diplomacy/ties'
import { noteAttack } from '@/core/lib/play/concordat/diplomacy/actions'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { defenseDensity } from '@/core/lib/play/concordat/sim/defense'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { TERRAIN_DEFENSE } from '@/core/lib/play/concordat/sim/tables'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatShip, ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { navy, sim } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)

// Land tiles of the same holder around the landing, nearest first
const beachhead = (state: ConcordatState, start: number, holder: number): number[] => {
  const { width, height, terrain } = state.map
  const seen = new Set<number>([start])
  const queue = [start]

  for (let head = 0; head < queue.length && queue.length < navy.landingTiles * 4; head++) {
    const count = neighborsOf(queue[head], width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (seen.has(next) || terrain[next] === ConcordatTerrains.Sea) continue
      seen.add(next)
      if (state.owner[next] === holder) queue.push(next)
    }
  }

  return queue
}

// Troops it takes to hold a tile
const holdCost = (state: ConcordatState, ship: ConcordatShip, tile: number, holder: number) => {
  let cost = defenseDensity(state, ship.owner, holder) * TERRAIN_DEFENSE[state.map.terrain[tile]]
  cost *= 1 + fortressBonus(state, holder, tile)
  if (holder && state.players[holder - 1].capital === tile) cost *= sim.capitalDefense

  return cost
}

// Troops left join a push on the same nation
const joinPush = (state: ConcordatState, ship: ConcordatShip, troops: number, holder: number) => {
  const me = state.players[ship.owner - 1]
  const corps = state.corps.find((other) => other.owner === me.id && other.target === holder)
  if (corps) corps.troops += troops
  else if (state.corps.filter((other) => other.owner === me.id).length < sim.maxCorps) {
    state.corps.push({
      id: state.nextCorpsId++,
      owner: me.id,
      target: holder,
      troops,
      progress: 0,
    })
  } else {
    me.troops += troops
  }
}

/**
 * A transport reached its coast: take a beachhead, the rest push on
 * @param {ConcordatState} state - Game
 * @param {ConcordatShip} ship - Transport
 * @return {void}
 */

export const landShip = (state: ConcordatState, ship: ConcordatShip): void => {
  const me = state.players[ship.owner - 1]
  const holder = state.owner[ship.landing]
  const target = holder ? state.players[holder - 1] : null

  // Alliance made at sea, or a nation fallen: the troops sail home
  if (holder === me.id || (target && (!target.alive || hasTreaty(state, me.id, holder)))) {
    me.troops += ship.troops
    return
  }
  if (holder) noteAttack(state, me.id, holder)

  let troops = ship.troops
  let taken = 0
  for (const tile of beachhead(state, ship.landing, holder).slice(0, navy.landingTiles)) {
    const cost = holdCost(state, ship, tile, holder)
    if (troops < cost) break

    troops -= cost * sim.attackerLoss
    if (target) target.troops = Math.max(0, target.troops - cost * sim.defenderLoss)
    transferTile(state, tile, me.id)
    taken++
  }

  // Nothing taken is a rout
  if (!taken) {
    me.troops += troops * (1 - navy.landingFail)
    emit(state, { tick: state.tick, kind: 'sunk', actor: 0, victim: me.id, tile: ship.landing })

    return
  }
  emit(state, {
    tick: state.tick,
    kind: 'landed',
    actor: me.id,
    victim: holder,
    tile: ship.landing,
  })
  joinPush(state, ship, troops, holder)
}

/**
 * Nations that would sink a transport that gets near
 * @param {ConcordatState} state - Game
 * @param {ConcordatShip} ship - Transport
 * @return {number[]} - Nations
 */

export const foesOf = (state: ConcordatState, ship: ConcordatShip): number[] => {
  const foes = new Set<number>([state.owner[ship.landing]])
  for (const tie of state.relations) {
    if (tie.kind !== 'hostile') continue
    if (tie.a === ship.owner) foes.add(tie.b)
    else if (tie.b === ship.owner) foes.add(tie.a)
  }

  return [...foes].filter((id) => id && id !== ship.owner && state.players[id - 1].alive)
}

/**
 * Nations whose warships guard a transport
 * @param {ConcordatState} state - Game
 * @param {number} owner - Owner of the transport
 * @return {number[]} - Nations
 */

export const escortsOf = (state: ConcordatState, owner: number): number[] => [
  owner,
  ...alliesOf(state, owner),
]
