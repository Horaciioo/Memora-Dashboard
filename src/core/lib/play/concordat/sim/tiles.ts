import { settleBuildingOnCapture } from '@/core/lib/play/concordat/buildings/capture'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { TERRAIN_INCOME } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

const near = new Int32Array(NEIGHBOR_SLOTS)
const ring = new Int32Array(NEIGHBOR_SLOTS)

// Border flag of a tile
const refreshFront = (state: ConcordatState, tile: number): void => {
  const holder = state.owner[tile]
  if (!holder) return

  const { width, height, terrain } = state.map
  const count = neighborsOf(tile, width, height, near)
  let isBorder = false
  for (let slot = 0; slot < count; slot++) {
    const next = near[slot]
    if (terrain[next] !== ConcordatTerrains.Sea && state.owner[next] !== holder) isBorder = true
  }

  const front = state.players[holder - 1].front
  if (isBorder) front.add(tile)
  else front.delete(tile)
}

// Province count and held share of one player
const countProvince = (state: ConcordatState, player: number, tile: number, step: 1 | -1): void => {
  const province = state.map.province[tile]
  if (!province) return

  const stride = state.map.provinces.length + 1
  const slot = player * stride + province
  const needed = Math.ceil(
    state.map.provinces[province - 1].tiles * CONCORDAT.sim.provinceHeldShare
  )
  const wasHeld = state.provinceCounts[slot] >= needed
  state.provinceCounts[slot] += step
  const isHeld = state.provinceCounts[slot] >= needed
  if (wasHeld === isHeld) return

  state.players[player - 1].provincesHeld += isHeld ? 1 : -1
}

/**
 * Give a tile to a player, zero for none
 * @param {ConcordatState} state - Game
 * @param {number} tile - Tile
 * @param {number} to - New owner
 * @return {void}
 */

export const transferTile = (state: ConcordatState, tile: number, to: number): void => {
  const from = state.owner[tile]
  if (from === to) return

  settleBuildingOnCapture(state, tile, from, to)

  // Leave the old owner
  const income = TERRAIN_INCOME[state.map.terrain[tile]]
  if (from) {
    const loser = state.players[from - 1]
    loser.tiles--
    loser.income -= income
    loser.front.delete(tile)
    countProvince(state, from, tile, -1)
  }

  // Join the new one
  state.owner[tile] = to
  if (to) {
    const winner = state.players[to - 1]
    winner.tiles++
    winner.income += income
    countProvince(state, to, tile, 1)
  }

  // Borders of the tile and around it
  refreshFront(state, tile)
  const count = neighborsOf(tile, state.map.width, state.map.height, ring)
  for (let slot = 0; slot < count; slot++) refreshFront(state, ring[slot])
  state.changed.push(tile)
}

/**
 * Rebuild counters and borders from the owner layer
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const rebuildDerived = (state: ConcordatState): void => {
  const layer = state.owner.slice()
  state.owner.fill(0)
  state.provinceCounts.fill(0)
  for (const player of state.players) {
    player.tiles = 0
    player.income = 0
    player.provincesHeld = 0
    player.front.clear()
  }

  // Replay every owned tile
  for (let tile = 0; tile < layer.length; tile++)
    if (layer[tile]) transferTile(state, tile, layer[tile])
  state.changed.length = 0
}
