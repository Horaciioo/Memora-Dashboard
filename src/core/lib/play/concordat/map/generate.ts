import { ConcordatTerrains } from '@/utils/constants/concordat'
import { buildLand } from '@/core/lib/play/concordat/map/land'
import { buildProvinces } from '@/core/lib/play/concordat/map/provinces'
import { buildClimate, buildHeights } from '@/core/lib/play/concordat/map/relief'
import { pickStarts } from '@/core/lib/play/concordat/map/starts'
import { classifyTerrain } from '@/core/lib/play/concordat/map/terrain'
import { frameOf, sampleLand } from '@/core/lib/play/concordat/map/world'
import { seededRng } from '@/core/lib/play/seeded'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatMap } from '@/types/concordat'
import type { ConcordatSizeName, ConcordatStyleName } from '@/utils/constants/concordat'

/**
 * Map request
 * @typedef {Object} ConcordatMapRequest
 */

export interface ConcordatMapRequest {
  seed: number
  size: ConcordatSizeName
  style: ConcordatStyleName
  // Starts wanted
  actors: number
}

/**
 * Map from a seed, the same request always gives the same map
 * @param {ConcordatMapRequest} request - Map request
 * @return {ConcordatMap} - Map
 */

export const generateMap = (request: ConcordatMapRequest): ConcordatMap => {
  const { seed, size, style, actors } = request
  const { ppd, provinces: wanted } = CONCORDAT.sizes[size]
  const rng = seededRng(`concordat:${seed}`)

  // Real land, then relief and climate on top
  const frame = frameOf(ppd, style)
  const { width, height } = frame
  const sampled = sampleLand(ppd, style)
  const heights = buildHeights(seed, frame, sampled.land, Math.max(8, frame.pixels * 6))
  const land = buildLand(heights, 0, width, height)
  const terrain = classifyTerrain({
    seed,
    width,
    height,
    heights,
    land,
    seaLevel: 0,
    climate: buildClimate(frame),
  })

  // Provinces then starts
  // Rivers are water, a province holds dry land only
  const dry = land.map((value, tile) => (terrain[tile] === ConcordatTerrains.Sea ? 0 : value))
  const { province, provinces } = buildProvinces({ land: dry, terrain, width, height, wanted, rng })
  const starts = pickStarts(terrain, width, height, actors, rng)

  return { width, height, seed, style, terrain, province, provinces, starts }
}
