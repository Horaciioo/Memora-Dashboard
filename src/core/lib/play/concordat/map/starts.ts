import { distanceBetween, neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map/grid'
import { tileNoise } from '@/core/lib/play/concordat/sim/rng'
import type { SeededRng } from '@/core/lib/play/seeded'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { ConcordatTerrains } from '@/utils/constants/concordat'

/**
 * Land tiles a start claims, grown raggedly from the origin
 * @param {number} origin - Start tile
 * @param {Uint8Array} terrain - Terrain ids
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {(tile: number) => boolean} [isFree] - Tile still claimable
 * @param {number} [wanted] - Tiles wanted
 * @return {number[]} - Claimed tiles, short when the land is small
 */

export const startTerritory = (
  origin: number,
  terrain: Uint8Array,
  width: number,
  height: number,
  isFree: (tile: number) => boolean = () => true,
  wanted: number = CONCORDAT.map.start.tiles
): number[] => {
  const seen = new Set<number>([origin])
  const claimed = [origin]
  const frontier: number[] = []
  const near = new Int32Array(NEIGHBOR_SLOTS)

  // Candidate neighbours of a tile joined to the area
  const open = (tile: number): void => {
    const count = neighborsOf(tile, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (seen.has(next) || terrain[next] === ConcordatTerrains.Sea || !isFree(next)) continue
      seen.add(next)
      frontier.push(next)
    }
  }

  // Grow by random picks so the shape stays ragged
  open(origin)
  while (claimed.length < wanted && frontier.length) {
    const pick = Math.floor(tileNoise(origin + claimed.length, 7) * frontier.length)
    claimed.push(frontier[pick])
    const joined = frontier[pick]
    frontier[pick] = frontier[frontier.length - 1]
    frontier.pop()
    open(joined)
  }

  return claimed
}

// Land tiles that can host a start
const hostTiles = (terrain: Uint8Array, width: number, height: number): number[] => {
  const hosts: number[] = []
  const margin = 4

  for (let tile = 0; tile < terrain.length; tile++) {
    const x = tile % width
    const y = (tile - x) / width
    const kind = terrain[tile]
    if (x < margin || y < margin || x >= width - margin || y >= height - margin) continue
    if (kind === ConcordatTerrains.Sea || kind === ConcordatTerrains.Mountain) continue
    if (kind === ConcordatTerrains.River) continue
    hosts.push(tile)
  }

  return hosts
}

// Farthest-first pick among candidates
const spread = (candidates: number[], count: number, width: number, rng: SeededRng): number[] => {
  const chosen = [candidates[Math.floor(rng() * candidates.length)]]
  const gap = candidates.map((tile) => distanceBetween(tile, chosen[0], width))

  // Each pick is the tile farthest from all chosen
  while (chosen.length < count) {
    let best = 0
    for (let index = 1; index < candidates.length; index++) if (gap[index] > gap[best]) best = index
    chosen.push(candidates[best])
    for (let index = 0; index < candidates.length; index++) {
      gap[index] = Math.min(gap[index], distanceBetween(candidates[index], candidates[best], width))
    }
  }

  return chosen
}

/**
 * Fair start tiles, spread over the land
 * @param {Uint8Array} terrain - Terrain ids
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} count - Starts wanted
 * @param {SeededRng} rng - Random source
 * @return {number[]} - Start tiles, fewer when the land is too small
 */

export const pickStarts = (
  terrain: Uint8Array,
  width: number,
  height: number,
  count: number,
  rng: SeededRng
): number[] => {
  const { start } = CONCORDAT.map
  const hosts = hostTiles(terrain, width, height)

  // Keep tiles whose land holds a full start
  const sample: number[] = []
  const step = Math.max(1, Math.floor(hosts.length / start.candidates))
  for (let index = Math.floor(rng() * step); index < hosts.length; index += step) {
    const area = startTerritory(hosts[index], terrain, width, height)
    if (area.length >= start.tiles) sample.push(hosts[index])
  }
  if (sample.length < count) return sample

  return spread(sample, count, width, rng)
}
