import { seededRng } from '@/core/lib/play/seeded'
import { ECHO_SETTINGS } from '@/declarations/play'

/**
 * Symbol placed on a card, offsets in half card sizes from the center
 * @typedef {Object} EchoPlacement
 * @property {number} symbol - Symbol id
 * @property {number} x - Offset to the right, -1 to 1
 * @property {number} y - Offset down, -1 to 1
 * @property {number} radius - Size in half card widths, 0 to 1
 * @property {number} angle - Tilt in degrees
 */

export interface EchoPlacement {
  symbol: number
  x: number
  y: number
  radius: number
  angle: number
}

// Card width over height, playing card proportions
export const ECHO_CARD_RATIO = 5 / 7

// Card height in half widths
const HEIGHT = 1 / ECHO_CARD_RATIO

// Edge gap, spacing and tries before the symbols shrink
const EDGE = 0.07
const GAP = 0.035
const TRIES = 48
const SHRINK = 0.97
const START_RADIUS = 0.62
// Tilt stays readable
const TILT = 65

/**
 * Place the circles in the card without overlap, each one where the room is widest
 * @param {number[]} radii - Radii, largest first
 * @param {() => number} random - Source in [0, 1)
 * @return {{ x: number, y: number }[] | null} - Centers, null when stuck
 */

const settle = (radii: number[], random: () => number): { x: number; y: number }[] | null => {
  const centers: { x: number; y: number }[] = []

  for (const radius of radii) {
    const reachX = 1 - EDGE - radius
    const reachY = HEIGHT - EDGE - radius
    let best: { x: number; y: number } | undefined
    let room = GAP

    for (let attempt = 0; attempt < TRIES; attempt += 1) {
      const candidate = { x: (random() * 2 - 1) * reachX, y: (random() * 2 - 1) * reachY }
      const clearance = Math.min(
        reachX - Math.abs(candidate.x),
        reachY - Math.abs(candidate.y),
        ...centers.map(
          (other, index) =>
            Math.hypot(other.x - candidate.x, other.y - candidate.y) - radius - radii[index]
        )
      )
      if (clearance >= room) {
        best = candidate
        room = clearance
      }
    }
    if (!best) return null
    centers.push(best)
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
    .map((symbol) => ({
      symbol,
      scale: min + random() * (max - min),
      angle: (random() * 2 - 1) * TILT,
    }))
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
        x: centers[index].x,
        y: centers[index].y / HEIGHT,
      }))
    }
  }

  return []
}
