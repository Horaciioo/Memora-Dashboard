import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfPadLayout } from '@/core/lib/play/golf/types'

// Points of the five holes, west to east
const POINTS = [2, 1, 0, 1, 2]

// Depth of each pocket, the 0 sits deepest
const DEPTHS = [1.3, 1.9, 2.5, 1.9, 1.3]

// Width of a pocket
const WIDTH = 1.8

// Landing strip depth before the pockets
const LANDING = 1.6

/**
 * Five side by side holes behind a landing strip
 * @param {number} z - South edge of the landing strip
 * @param {Partial<GolfPadLayout>} [edges] - Glass or open edges of every slab
 * @return {{ pads: GolfPadLayout[], cups: GolfCupLayout[], centre: [number, number] }} - Field
 */

export const cupField = (z: number, edges: Partial<GolfPadLayout> = {}) => {
  const left = (-WIDTH * POINTS.length) / 2
  const pockets = POINTS.map((points, index) => ({
    pad: slab(left + index * WIDTH, z + LANDING, WIDTH, DEPTHS[index], 0, 0, edges),
    cup: {
      at: [left + (index + 0.5) * WIDTH, z + LANDING + DEPTHS[index] / 2] as [number, number],
      points,
    },
  }))

  return {
    pads: [
      slab(left, z, WIDTH * POINTS.length, LANDING, 0, 0, edges),
      ...pockets.map(({ pad }) => pad),
    ],
    cups: pockets.map(({ cup }) => cup),
    // Middle cup, the one the camera follows
    centre: pockets[2].cup.at,
  }
}

// Width of the whole field
export const FIELD_WIDTH = WIDTH * POINTS.length
