import { railBetween, slab } from '@/declarations/play/golf/courses/build'
import type { GolfPadLayout } from '@/core/lib/play/golf/types'

// Points of the five bins, west to east
const POINTS = [2, 1, 0, 1, 2]

// Distance from the bin mouth to its hole, the 0 sits deepest
const REACH = [0.6, 0.9, 1.2, 0.9, 0.6]

// Width and depth of a bin
const WIDTH = 1.8
const DEPTH = 1.8

/**
 * Five bins side by side at the foot of a slope, split by low dividers
 * @param {number} z - South edge of the bins, where the slope ends
 * @param {Partial<GolfPadLayout>} [edges] - Glass or open edges of every slab
 * @return {{ pads: GolfPadLayout[], rails: GolfRailLayout[], cups: GolfCupLayout[], centre: [number, number] }} - Field
 */

export const cupField = (z: number, edges: Partial<GolfPadLayout> = {}) => {
  const left = (-WIDTH * POINTS.length) / 2
  const cups = POINTS.map((points, index) => ({
    at: [left + (index + 0.5) * WIDTH, z + REACH[index]] as [number, number],
    points,
  }))

  return {
    pads: POINTS.map((_, index) => slab(left + index * WIDTH, z, WIDTH, DEPTH, 0, 0, edges)),
    // Dividers between neighbouring bins
    rails: POINTS.slice(1).map((_, index) => {
      const x = left + (index + 1) * WIDTH

      return railBetween([x, z], [x, z + DEPTH], [1, 0])
    }),
    cups,
    // Middle cup, the one the camera follows
    centre: cups[2].at,
  }
}
