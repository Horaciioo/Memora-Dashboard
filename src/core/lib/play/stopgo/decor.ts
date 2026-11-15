import { seededRng } from '@/core/lib/play/seeded'
import type { SeededRng } from '@/core/lib/play/seeded'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_DECOR, STOPGO_TRACK } from '@/declarations/play/stopgo/track'
import type { StopGoDecorKind } from '@/declarations/play/stopgo/track'

import { edgeAt, pointAt, signsOf } from '@/core/lib/play/stopgo/track'
import type { StopGoTrackPlan } from '@/core/lib/play/stopgo/track'

/**
 * Piece of scenery, drawn by kind
 * @typedef {Object} StopGoDecorItem
 */

export interface StopGoDecorItem {
  id: string
  kind: StopGoDecorKind
  x: number
  y: number
  radius: number
  // Quarter turns of variety, 0 to 1
  tilt: number
}

interface Spot {
  x: number
  y: number
  radius: number
}

const SAMPLES = 70
const roadHalf = (plan: StopGoTrackPlan) =>
  plan.maxOffset + (STOPGO_TRACK.roadWidth * STOPGO_TRACK.kerbRatio) / 2

/**
 * Points of a map that scenery must stay away from, road and signs
 * @param {StopGoTrackPlan} plan - Track
 * @param {number} mapIndex - Map
 * @return {Spot[]} - Obstacles
 */

const obstaclesOf = (plan: StopGoTrackPlan, mapIndex: number): Spot[] => {
  const { mapKm } = STOPGO_SETTINGS
  const first = mapIndex * mapKm
  const road = Array.from({ length: SAMPLES + 1 }, (_, step) => {
    const { x, y } = pointAt(plan, first + (step / SAMPLES) * mapKm, (plan.lanes - 1) / 2)

    return { x, y, radius: roadHalf(plan) }
  })
  const signs = signsOf(plan.target)
    .filter(({ km }) => km >= first && km <= first + mapKm)
    .map(({ km }) => ({ ...edgeAt(plan, km), radius: STOPGO_TRACK.signClear * 2 }))

  return [...road, ...signs]
}

/**
 * Weighted pick
 * @param {SeededRng} rng - Random source
 * @return {typeof STOPGO_DECOR.scatter[number]} - Recipe
 */

const pickScatter = (rng: SeededRng) => {
  const total = STOPGO_DECOR.scatter.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = rng() * total
  for (const entry of STOPGO_DECOR.scatter) {
    roll -= entry.weight
    if (roll <= 0) return entry
  }

  return STOPGO_DECOR.scatter[0]
}

/**
 * Scenery of one map, the same seed always gives the same scenery
 * @param {StopGoTrackPlan} plan - Track
 * @param {string} seed - Public seed, never anything secret
 * @param {number} mapIndex - Map
 * @return {StopGoDecorItem[]} - Pieces, none on a road or under a sign
 */

export const decorOf = (plan: StopGoTrackPlan, seed: string, mapIndex: number) => {
  const rng = seededRng(`${seed}:${mapIndex}`)
  const blocked = obstaclesOf(plan, mapIndex)
  const top = plan.maps[mapIndex][0].start.y - plan.mapHeight
  const items: StopGoDecorItem[] = []

  const place = (kind: StopGoDecorKind, radius: number) => {
    for (let attempt = 0; attempt < STOPGO_DECOR.tries; attempt++) {
      const x = plan.minX + rng() * plan.width
      const y = top + rng() * plan.mapHeight
      const free = blocked.every(
        (spot) => Math.hypot(spot.x - x, spot.y - y) > spot.radius + radius + STOPGO_DECOR.gap
      )
      if (!free) continue
      blocked.push({ x, y, radius })
      items.push({ id: `${mapIndex}-${items.length}`, kind, x, y, radius, tilt: rng() })

      return
    }
  }

  for (let count = 0; count < STOPGO_DECOR.landmarksPerMap; count++) {
    const landmark = STOPGO_DECOR.landmarks[Math.floor(rng() * STOPGO_DECOR.landmarks.length)]
    place(landmark.kind, landmark.radius)
  }
  for (let count = 0; count < STOPGO_DECOR.scatterPerMap; count++) {
    const { kind, radius } = pickScatter(rng)
    place(kind, radius[0] + rng() * (radius[1] - radius[0]))
  }

  return items
}
