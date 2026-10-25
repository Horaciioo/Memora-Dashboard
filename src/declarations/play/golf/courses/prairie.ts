import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * La Prairie, nine holes to learn the swing then the powers
 * @type {GolfHoleLayout[]}
 */

export const PRAIRIE_HOLES: GolfHoleLayout[] = [
  // Straight warm up
  {
    par: 2,
    tee: [0, 0],
    cup: [0, 10],
    pads: [{ at: [-1.5, -1.5], size: [3, 13] }],
    orbs: [[0, 5]],
  },
  // Dogleg right, a bumper in the bend
  {
    par: 3,
    tee: [0, 0],
    cup: [8, 7],
    pads: [
      { at: [-1.5, -1.5], size: [3, 10] },
      { at: [1.5, 5.5], size: [8, 3] },
    ],
    bumpers: [{ at: [-0.6, 7.6], radius: 0.4 }],
    orbs: [[4.5, 7]],
  },
  // Up the ramp to the plateau
  {
    par: 3,
    tee: [0, 0],
    cup: [1.4, 12.4],
    pads: [
      { at: [-1.5, -1.5], size: [3, 6] },
      { at: [-1.5, 4.5], size: [3, 4], rise: { axis: 'z', to: 0.8 } },
      { at: [-2.5, 8.5], size: [5, 5], height: 0.8 },
    ],
    blocks: [{ at: [-0.4, 10.6], size: [2.9, 0.5] }],
    orbs: [
      [-1.6, 10],
      [1.6, 10],
    ],
  },
  // Through the turning bar
  {
    par: 3,
    tee: [0, 0],
    cup: [0, 11.5],
    pads: [{ at: [-2, -1.5], size: [4, 14.5] }],
    spinners: [{ at: [0, 6], length: 3.2, speed: 1.6 }],
    blocks: [
      { at: [-2, 9], size: [1.1, 0.5] },
      { at: [0.9, 9], size: [1.1, 0.5] },
    ],
    orbs: [[0, 3]],
  },
  // The bridge without rails
  {
    par: 3,
    tee: [0, 0],
    cup: [8, 11],
    pads: [
      { at: [-1.5, -1.5], size: [3, 8.3] },
      { at: [1.5, 5.2], size: [5, 1.6], open: 'ns' },
      { at: [6.5, 3.5], size: [3, 9] },
    ],
    orbs: [[4, 6]],
  },
  // Sand on both sides, bumpers before the cup
  {
    par: 3,
    tee: [0, 0],
    cup: [0, 11.3],
    pads: [
      { at: [-3, -1.5], size: [6, 5] },
      { at: [-3, 3.5], size: [2, 4], surface: GolfSurfaces.Sand },
      { at: [-1, 3.5], size: [2, 4] },
      { at: [1, 3.5], size: [2, 4], surface: GolfSurfaces.Sand },
      { at: [-3, 7.5], size: [6, 5] },
    ],
    bumpers: [
      { at: [-1.1, 9.6], radius: 0.35 },
      { at: [0, 9.6], radius: 0.35 },
      { at: [1.1, 9.6], radius: 0.35 },
    ],
    orbs: [
      [-2, 1.5],
      [2, 1.5],
    ],
  },
  // Ice slide down to the green
  {
    par: 3,
    tee: [0, 0],
    cup: [0, 12],
    pads: [
      { at: [-1.5, -1.5], size: [3, 4], height: 1 },
      {
        at: [-1.5, 2.5],
        size: [3, 5],
        height: 1,
        rise: { axis: 'z', to: 0 },
        surface: GolfSurfaces.Ice,
      },
      { at: [-3, 7.5], size: [6, 6] },
    ],
    blocks: [{ at: [-0.5, 9.4], size: [1, 1] }],
    orbs: [
      [-2, 10],
      [2, 10],
    ],
  },
  // Drop from the ledge into the maze
  {
    par: 3,
    tee: [0, 0],
    cup: [2.6, 12.4],
    pads: [
      { at: [-1.5, -1.5], size: [3, 7], height: 0.6 },
      { at: [-4, 5.5], size: [8, 8] },
    ],
    blocks: [
      { at: [-4, 8.2], size: [5, 0.5] },
      { at: [-1, 10.6], size: [5, 0.5] },
    ],
    orbs: [[-2.8, 12]],
  },
  // Grand finale, bars on the plateau
  {
    par: 4,
    tee: [0, 0],
    cup: [0, 18],
    pads: [
      { at: [-1.5, -1.5], size: [3, 6] },
      { at: [-1.5, 4.5], size: [3, 3], rise: { axis: 'z', to: 0.6 } },
      { at: [-4, 7.5], size: [8, 4], height: 0.6 },
      { at: [-1.5, 11.5], size: [3, 4], height: 0.6, surface: GolfSurfaces.Boost, push: [0, 1] },
      { at: [-3, 15.5], size: [6, 4], height: 0.6 },
    ],
    blocks: [{ at: [-0.8, 8.4], size: [1.6, 2.2] }],
    spinners: [
      { at: [-2, 9.5], length: 2.4, speed: 2 },
      { at: [2, 9.5], length: 2.4, speed: -2 },
    ],
    bumpers: [
      { at: [-1.8, 17.2], radius: 0.35 },
      { at: [1.8, 17.2], radius: 0.35 },
    ],
    orbs: [
      [0, 2],
      [-3.2, 8.2],
      [3.2, 8.2],
    ],
  },
]
