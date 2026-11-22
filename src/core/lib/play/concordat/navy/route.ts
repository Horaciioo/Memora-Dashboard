import { distanceBetween } from '@/core/lib/play/concordat/map'
import { seaAround, seaPath, shoresNear } from '@/core/lib/play/concordat/navy/path'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const { navy } = CONCORDAT

/**
 * Sea way of a landing: where it starts, the shore it reaches and the straight distance
 * @typedef {Object} ConcordatSailRoute
 */

export interface ConcordatSailRoute {
  way: number[]
  landing: number
  distance: number
}

// Own coast tiles of a nation, read again every two seconds: bots ask for many routes, the shore moves slowly
const COAST_TICKS = 20
const coastCache = new WeakMap<ConcordatState, { tick: number; coasts: Map<number, number[]> }>()

const coastsOf = (state: ConcordatState, playerId: number): number[] => {
  let held = coastCache.get(state)
  if (!held || state.tick - held.tick >= COAST_TICKS || state.tick < held.tick) {
    held = { tick: state.tick, coasts: new Map() }
    coastCache.set(state, held)
  }
  let coasts = held.coasts.get(playerId)
  if (!coasts) {
    coasts = []
    for (let index = 0; index < state.owner.length; index++) {
      if (
        state.owner[index] === playerId &&
        state.map.terrain[index] !== ConcordatTerrains.Sea &&
        seaAround(state.map, index).length
      )
        coasts.push(index)
    }
    held.coasts.set(playerId, coasts)
  }

  return coasts
}

// Own coast tiles nearest to a tile, closest first
const nearestCoasts = (
  state: ConcordatState,
  playerId: number,
  tile: number
): { tile: number; distance: number }[] => {
  const best: { tile: number; distance: number }[] = []

  for (const index of coastsOf(state, playerId)) {
    if (state.owner[index] !== playerId) continue

    // A full list only takes a tile that beats its farthest
    const distance = distanceBetween(index, tile, state.map.width)
    if (best.length >= navy.starts && distance >= best[best.length - 1].distance) continue

    let at = best.length
    while (at > 0 && best[at - 1].distance > distance) at--
    best.splice(at, 0, { tile: index, distance })
    if (best.length > navy.starts) best.pop()
  }

  return best
}

/**
 * Sea way from the own coast nearest to a landing, whatever the distance, no building needed. The tile may lie anywhere inland: the boat makes for the nearest shore of the same holder
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Sender
 * @param {number} tile - Land tile aimed at
 * @return {ConcordatSailRoute | null} - Way, shore to land on and straight distance, null when none
 */

export const sailRoute = (
  state: ConcordatState,
  playerId: number,
  tile: number
): ConcordatSailRoute | null => {
  const shores = shoresNear(state.map, state.owner, tile)
  const coasts = nearestCoasts(state, playerId, tile)
  if (!shores.length || !coasts.length) return null

  const starts = coasts.flatMap((coast) => seaAround(state.map, coast.tile))
  const goals = shores.flatMap((shore) => seaAround(state.map, shore))
  const way = seaPath(state.map, starts, goals)
  if (!way) return null

  // The shore the boat reached
  const end = way[way.length - 1]
  const landing = shores.find((shore) => seaAround(state.map, shore).includes(end)) ?? shores[0]

  return { way, landing, distance: coasts[0].distance }
}

/**
 * Land tile of a nation to head for when no tile was named: the one nearest to the capital, or to the start
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Sender
 * @param {number} target - Nation aimed at
 * @return {number} - Tile, minus one when the nation holds none
 */

export const aimTileOf = (state: ConcordatState, playerId: number, target: number): number => {
  const me = state.players[playerId - 1]
  const { width, terrain } = state.map
  const from = me.capital >= 0 ? me.capital : me.start
  let best = -1
  let gap = Infinity

  for (let index = 0; index < state.owner.length; index++) {
    if (state.owner[index] !== target || terrain[index] === ConcordatTerrains.Sea) continue

    const distance = from >= 0 ? distanceBetween(index, from, width) : 0
    if (distance < gap) {
      gap = distance
      best = index
    }
  }

  return best
}

/**
 * Sea way of a new warship: from the own coast nearest to the aimed sea tile
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Owner
 * @param {number} target - Sea tile aimed at
 * @return {number[] | null} - Way, its first tile is the launch tile, null when none
 */

export const warRoute = (
  state: ConcordatState,
  playerId: number,
  target: number
): number[] | null => {
  const starts = nearestCoasts(state, playerId, target).flatMap((coast) =>
    seaAround(state.map, coast.tile)
  )

  return starts.length ? seaPath(state.map, starts, [target]) : null
}
