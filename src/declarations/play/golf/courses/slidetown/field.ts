import { slab } from '@/declarations/play/golf/courses/build'
import type { GolfCupLayout, GolfPadLayout } from '@/core/lib/play/golf/types'

// Points of the six holes, west to east: two 3s, two 2s, a 1 and a 0
const POINTS = [3, 2, 1, 0, 2, 3]

// Width of a pocket
const WIDTH = 1.8

// Depth of the landing strip then of the pockets
const LANDING = 1.6
const POCKET = 2

// Width of the whole field
export const SLIDE_WIDTH = WIDTH * POINTS.length

/**
 * Six side by side holes behind a landing strip, at the foot of a slide
 * @param {number} z - South edge of the landing strip
 * @param {number} height - Floor height of the field
 * @return {{ pads: GolfPadLayout[], cups: GolfCupLayout[], centre: [number, number] }} - Field
 */

export const slideField = (z: number, height: number) => {
  const left = -SLIDE_WIDTH / 2

  return {
    pads: [slab(left, z, SLIDE_WIDTH, LANDING + POCKET, height)] as GolfPadLayout[],
    cups: POINTS.map((points, index): GolfCupLayout => ({
      at: [left + (index + 0.5) * WIDTH, z + LANDING + POCKET / 2],
      points,
    })),
    centre: [0, z + LANDING + POCKET / 2] as [number, number],
  }
}

/**
 * Height at the end of a slope
 * @param {number} from - Start height
 * @param {number} depth - Length along z
 * @param {number} slope - Drop per metre
 * @return {number} - End height
 */

export const dropped = (from: number, depth: number, slope: number): number => from - depth * slope
