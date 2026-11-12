import { seededRng } from '@/core/lib/play/seeded'
import { ECHO_SETTINGS } from '@/declarations/play'

/**
 * Symbol placed on a card, in card radius units from the center
 * @typedef {Object} EchoPlacement
 * @property {number} symbol - Symbol id
 * @property {number} x - Offset to the right, -1 to 1
 * @property {number} y - Offset down, -1 to 1
 * @property {number} radius - Size, 0 to 1
 * @property {number} angle - Tilt in degrees
 */

export interface EchoPlacement {
  symbol: number
  x: number
  y: number
  radius: number
  angle: number
}

// Edge gap, spacing and tries before the symbols shrink
const EDGE = 0.04
const GAP = 0.03
const TRIES = 400
const SHRINK = 0.96
const START_RADIUS = 0.46

/**
 * Try to place the circles without overlap
 * @param {number[]} radii - Radii, largest first
 * @param {() => number} random - Source in [0, 1)
 * @return {{ x: number, y: number }[] | null} - Centers, null when stuck
 */

const settle = (radii: number[], random: () => number): { x: number; y: number }[] | null => {
  const centers: { x: number; y: number }[] = []

  for (const radius of radii) {
    const reach = 1 - EDGE - radius
    let spot: { x: number; y: number } | undefined

    for (let attempt = 0; attempt < TRIES && !spot; attempt += 1) {
      const angle = random() * Math.PI * 2
      const distance = Math.sqrt(random()) * reach
      const candidate = { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }
      const isFree = centers.every(
        (other, index) =>
          Math.hypot(other.x - candidate.x, other.y - candidate.y) >= radius + radii[index] + GAP
      )
      if (isFree) spot = candidate
    }
    if (!spot) return null
    centers.push(spot)
  }

  return centers
}

/**
 * Where each symbol of a card sits: sizes differ, tilts differ, nothing overlaps
 * @param {number[]} symbols - Symbol ids of the card
 * @param {number} seed - Seed of the card
 * @return {EchoPlacement[]} - Placements
 */

export const layoutCard = (symbols: number[], seed: number): EchoPlacement[] => {
  const random = seededRng(`echo:${seed}`)
  const { min, max } = ECHO_SETTINGS.scale
  const sized = symbols
    .map((symbol) => ({ symbol, scale: min + random() * (max - min), angle: random() * 360 - 180 }))
    .toSorted((left, right) => right.scale - left.scale)

  // Shrink everything until the draw fits
  for (let factor = 1; factor > 0.2; factor *= SHRINK) {
    const radii = sized.map(({ scale }) => START_RADIUS * scale * factor)
    const centers = settle(radii, random)
    if (centers) {
      return sized.map(({ symbol, angle }, index) => ({
        symbol,
        angle,
        radius: radii[index],
        ...centers[index],
      }))
    }
  }

  return []
}
