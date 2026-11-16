import { settleBuildingOnCapture } from '@/core/lib/play/concordat/buildings/capture'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { troopCap } from '@/core/lib/play/concordat/sim/economy'
import { TERRAIN_INCOME } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatPhases, ConcordatTerrains } from '@/utils/constants/concordat'

const near = new Int32Array(NEIGHBOR_SLOTS)
const ring = new Int32Array(NEIGHBOR_SLOTS)

// Zone ids stay under this, the gold rides above
const ZONE_PACK = 4096

// True while a save is replayed, no reward then
let isReplaying = false

// Troops and gold for a zone just won
const rewardZone = (state: ConcordatState, playerId: number, province: number): void => {
  const winner = state.players[playerId - 1]
  // Fixed by the zone size, never by the purse, so retaking a zone cannot snowball
  const gold = Math.round(
    CONCORDAT.sim.zoneGoldMin + state.map.provinces[province - 1].tiles * CONCORDAT.sim.zoneGold
  )
  const cap = troopCap(winner)
  winner.troops = Math.min(cap, winner.troops + cap * CONCORDAT.sim.zoneTroops)
  winner.gold += gold

  // Detail packs the zone, then the gold above it
  emit(state, {
    tick: state.tick,
    kind: 'zoneWon',
    actor: playerId,
    victim: 0,
    tile: province + gold * ZONE_PACK,
  })
}

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

// A zone taken whole pays at the tile that completes it, from state alone so a restore pays nothing twice
const checkZoneComplete = (state: ConcordatState, player: number, tile: number): void => {
  const province = state.map.province[tile]
  if (!province || isReplaying || state.phase !== ConcordatPhases.Playing) return

  const stride = state.map.provinces.length + 1
  if (state.provinceCounts[player * stride + province] === state.map.provinces[province - 1].tiles)
    rewardZone(state, player, province)
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
    checkZoneComplete(state, to, tile)
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
  isReplaying = true
  for (let tile = 0; tile < layer.length; tile++)
    if (layer[tile]) transferTile(state, tile, layer[tile])
  isReplaying = false
  state.changed.length = 0
}
