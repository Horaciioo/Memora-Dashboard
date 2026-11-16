import { labelComponents, neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map/grid'
import type { SeededRng } from '@/core/lib/play/seeded'
import { CONCORDAT_PLACE_NAMES, CONCORDAT_PLACE_NOUNS } from '@/declarations/play/concordat/places'
import type { ConcordatProvince } from '@/types/concordat'
import { ConcordatResources, ConcordatTerrains } from '@/utils/constants/concordat'
import type { ConcordatResourceName, ConcordatTerrainId } from '@/utils/constants/concordat'

// Seed tiles, one per jittered cell and one per island
const pickSeeds = (
  land: Uint8Array,
  width: number,
  height: number,
  wanted: number,
  rng: SeededRng
): number[] => {
  const landCount = land.reduce((sum, value) => sum + value, 0)
  const cell = Math.max(3, Math.floor(Math.sqrt(landCount / Math.max(1, wanted))))
  const seeds: number[] = []

  // One random land tile per cell
  for (let top = 0; top < height; top += cell) {
    for (let left = 0; left < width; left += cell) {
      const candidates: number[] = []
      for (let y = top; y < Math.min(height, top + cell); y++) {
        for (let x = left; x < Math.min(width, left + cell); x++) {
          if (land[y * width + x]) candidates.push(y * width + x)
        }
      }
      if (candidates.length > cell) seeds.push(candidates[Math.floor(rng() * candidates.length)])
    }
  }

  // Every island gets a seed
  const islands = labelComponents(land, width, height)
  const seeded = new Set(seeds.map((tile) => islands.label[tile]))
  for (let tile = 0; tile < land.length; tile++) {
    const id = islands.label[tile]
    if (land[tile] && !seeded.has(id)) {
      seeded.add(id)
      seeds.push(tile)
    }
  }

  return seeds
}

// Resource from the terrain mix
const resourceOf = (counts: number[], rng: SeededRng): ConcordatResourceName => {
  const score = {
    [ConcordatResources.Grain]:
      counts[ConcordatTerrains.Plain] +
      counts[ConcordatTerrains.River] +
      counts[ConcordatTerrains.Coast] * 0.5,
    [ConcordatResources.Wood]: counts[ConcordatTerrains.Forest] * 1.4,
    [ConcordatResources.Metals]: counts[ConcordatTerrains.Mountain] * 1.6,
    [ConcordatResources.Stone]: counts[ConcordatTerrains.Hill] * 1.5,
    [ConcordatResources.Spices]: counts[ConcordatTerrains.Desert] * 1.6,
  }
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1] || rng() - 0.5)

  return ranked[0][0] as ConcordatResourceName
}

// Name from the dominant terrain
const nameOf = (terrain: ConcordatTerrainId, used: Set<string>, rng: SeededRng): string => {
  const nouns = CONCORDAT_PLACE_NOUNS[terrain]

  // Retry a few times then accept a repeat
  let name = ''
  for (let attempt = 0; attempt < 24; attempt++) {
    const noun = nouns[Math.floor(rng() * nouns.length)]
    const part = CONCORDAT_PLACE_NAMES[Math.floor(rng() * CONCORDAT_PLACE_NAMES.length)]
    const isVowel = /^[AEIOUYÉÈÊHaeiouyéèê]/.test(part)
    name = `${noun} ${isVowel ? "d'" : 'de '}${part}`
    if (!used.has(name)) break
  }
  used.add(name)

  return name
}

/**
 * Province per land tile and their descriptions
 * @param {Object} input - Map layers
 * @param {Uint8Array} input.land - Land mask
 * @param {Uint8Array} input.terrain - Terrain ids
 * @param {number} input.width - Width
 * @param {number} input.height - Height
 * @param {number} input.wanted - Province target
 * @param {SeededRng} input.rng - Random source
 * @return {{ province: Uint16Array, provinces: ConcordatProvince[] }} - Provinces
 */

export const buildProvinces = (input: {
  land: Uint8Array
  terrain: Uint8Array
  width: number
  height: number
  wanted: number
  rng: SeededRng
}): { province: Uint16Array; provinces: ConcordatProvince[] } => {
  const { land, terrain, width, height, wanted, rng } = input
  const province = new Uint16Array(land.length)
  const seeds = pickSeeds(land, width, height, wanted, rng)
  const queue = new Int32Array(land.length)
  const near = new Int32Array(NEIGHBOR_SLOTS)

  // Grow every seed at once
  let head = 0
  let tail = 0
  seeds.forEach((tile, index) => {
    province[tile] = index + 1
    queue[tail++] = tile
  })
  while (head < tail) {
    const tile = queue[head++]
    const count = neighborsOf(tile, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (land[next] && !province[next]) {
        province[next] = province[tile]
        queue[tail++] = next
      }
    }
  }

  // Describe each province
  const counts = seeds.map(() => new Array<number>(8).fill(0))
  const sums = seeds.map(() => ({ x: 0, y: 0, tiles: 0 }))
  for (let tile = 0; tile < land.length; tile++) {
    const id = province[tile]
    if (!id) continue
    counts[id - 1][terrain[tile]]++
    sums[id - 1].x += tile % width
    sums[id - 1].y += Math.floor(tile / width)
    sums[id - 1].tiles++
  }
  const used = new Set<string>()
  const provinces = seeds.map((_, index) => {
    const dominant = counts[index].indexOf(
      Math.max(...counts[index].slice(1))
    ) as ConcordatTerrainId

    return {
      id: index + 1,
      name: nameOf(dominant, used, rng),
      resource: resourceOf(counts[index], rng),
      tiles: sums[index].tiles,
      x: Math.round(sums[index].x / Math.max(1, sums[index].tiles)),
      y: Math.round(sums[index].y / Math.max(1, sums[index].tiles)),
    }
  })

  return { province, provinces }
}
