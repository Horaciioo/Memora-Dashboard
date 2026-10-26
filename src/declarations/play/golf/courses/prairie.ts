import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * La Prairie, six holes to learn the swing then the powers
 * @type {GolfHoleLayout[]}
 */

export const PRAIRIE_HOLES: GolfHoleLayout[] = [
  // S bend
  {
    tee: [0, 0],
    cup: [9, 13],
    pads: [
      { at: [-1.5, -1.5], size: [3, 9] },
      { at: [1.5, 4.5], size: [6, 3] },
      { at: [7.5, 4.5], size: [3, 10] },
    ],
    bumpers: [{ at: [9, 8.5], radius: 0.4 }],
    orbs: [[4.5, 6]],
  },
  // Ramp to a plateau open at the back
  {
    tee: [0, 0],
    cup: [15.5, 0],
    pads: [
      { at: [-1.5, -1.5], size: [10, 3] },
      { at: [8.5, -1.5], size: [3, 3], rise: { axis: 'x', to: 0.8 } },
      { at: [11.5, -3.5], size: [6, 7], height: 0.8, open: 'e' },
    ],
    blocks: [{ at: [13.6, -0.7], size: [0.5, 1.4] }],
    bumpers: [
      { at: [15.5, 2], radius: 0.35 },
      { at: [15.5, -2], radius: 0.35 },
    ],
    orbs: [[5, 0]],
  },
  // Fork round the pond, grass and bumper or slow sand
  {
    tee: [0, 0],
    cup: [0, 15.5],
    pads: [
      { at: [-3, -1.5], size: [6, 5.5] },
      { at: [-3, 4], size: [2, 8] },
      { at: [-1, 4], size: [2, 8], surface: GolfSurfaces.Water },
      { at: [1, 4], size: [2, 8], surface: GolfSurfaces.Sand },
      { at: [-3, 12], size: [6, 5] },
    ],
    blocks: [{ at: [-0.75, 13.4], size: [1.5, 0.4] }],
    bumpers: [{ at: [-2, 8], radius: 0.35 }],
    orbs: [
      [-2, 5],
      [2, 5],
    ],
  },
  // West past the mill, north through the gate
  {
    tee: [0, 0],
    cup: [-11.5, 7.5],
    pads: [
      { at: [-10, -1.5], size: [11.5, 3] },
      { at: [-13, -1.5], size: [3, 10.5] },
    ],
    spinners: [
      { at: [-5, 0], length: 2.6, speed: 1.8 },
      { at: [-11.5, 3.5], length: 2.6, speed: -2 },
    ],
    blocks: [
      { at: [-13, 5.5], size: [1, 0.4] },
      { at: [-11, 5.5], size: [1, 0.4] },
    ],
    orbs: [[-2.5, 0]],
  },
  // Terraces down, sand on the landing
  {
    tee: [0, 0],
    cup: [-4.5, 18.5],
    pads: [
      { at: [-2, -1.5], size: [4, 7.5], height: 1.2 },
      { at: [-6, 6], size: [4, 4], height: 0.6 },
      { at: [-2, 6], size: [4, 4], height: 0.6, surface: GolfSurfaces.Sand },
      { at: [-6, 10], size: [3, 10] },
    ],
    bumpers: [
      { at: [-4, 14], radius: 0.35 },
      { at: [-5, 16.5], radius: 0.35 },
    ],
    orbs: [
      [0, 3],
      [-4.5, 12],
    ],
  },
  // The loop round the garden, up to the high green
  {
    tee: [0, 0],
    cup: [4, 5],
    pads: [
      { at: [-1.5, -1.5], size: [3, 13.5] },
      { at: [-1.5, 12], size: [12, 3] },
      { at: [10.5, 3], size: [3, 12] },
      { at: [6.5, 3], size: [4, 3], height: 0.8, rise: { axis: 'x', to: 0 } },
      { at: [2.5, 2], size: [4, 6], height: 0.8 },
    ],
    blocks: [{ at: [4, 12.9], size: [0.5, 1.2] }],
    bumpers: [
      { at: [3.3, 3], radius: 0.3 },
      { at: [3.3, 7], radius: 0.3 },
    ],
    orbs: [
      [0, 6],
      [6, 13.5],
      [12, 9],
    ],
  },
]
