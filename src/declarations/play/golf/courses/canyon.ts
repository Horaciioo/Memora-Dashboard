import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Le Canyon, six holes over water and cliffs
 * @type {GolfHoleLayout[]}
 */

export const CANYON_HOLES: GolfHoleLayout[] = [
  // Ford: thin bridge over the river or round the bank
  {
    tee: [0, 0],
    cup: [12.5, 1],
    pads: [
      { at: [-1.5, -2], size: [3.5, 6.5] },
      { at: [2, -2], size: [3, 4] },
      { at: [5, -0.5], size: [4, 1] },
      { at: [5, 0.5], size: [4, 1.5], surface: GolfSurfaces.Water },
      { at: [5, -2], size: [4, 1.5], surface: GolfSurfaces.Water },
      { at: [2, 2.5], size: [7, 2] },
      { at: [9, -2], size: [5, 6.5] },
    ],
    bumpers: [{ at: [11, 3], radius: 0.35 }],
    orbs: [[7, 0]],
  },
  // Jump the gap, or the long plank on the side
  {
    tee: [0, 0],
    cup: [1.5, 16.5],
    pads: [
      { at: [-1.5, -1.5], size: [3, 7.5] },
      { at: [-1.5, 6], size: [3, 3], rise: { axis: 'z', to: 0.6 }, open: 'n' },
      { at: [1.5, 3], size: [3.5, 2] },
      { at: [4, 5], size: [1, 6.4], open: 'ew' },
      { at: [-3, 11.4], size: [8, 6.6], open: 's' },
    ],
    blocks: [{ at: [-1, 14.2], size: [2, 0.4] }],
    orbs: [
      [0, 3],
      [4.5, 8.2],
    ],
  },
  // Switchbacks down, ice on the middle shelf
  {
    tee: [0, 0],
    cup: [-0.5, 15],
    pads: [
      { at: [-1.5, -1.5], size: [3, 8.5], height: 1.6 },
      { at: [1.5, 4], size: [7.5, 3], height: 1.6 },
      { at: [9, 4], size: [3, 3], height: 1.6, rise: { axis: 'x', to: 0.8 } },
      { at: [9, 7], size: [3, 6], height: 0.8 },
      { at: [7, 10], size: [2, 3], height: 0.8 },
      { at: [4, 10], size: [3, 3], height: 0.8, surface: GolfSurfaces.Ice },
      { at: [1, 10], size: [3, 3], height: 0.8 },
      { at: [-2, 9], size: [3, 8] },
    ],
    bumpers: [{ at: [-0.5, 13.2], radius: 0.35 }],
    orbs: [
      [0, 5],
      [10.5, 9],
      [5.5, 11.5],
    ],
  },
  // Off the mesa over the pond, or down the ramp
  {
    tee: [0, 0],
    cup: [0, 13.8],
    pads: [
      { at: [-2, -1.5], size: [4, 7.5], height: 1.5, open: 'n' },
      { at: [2, 1], size: [3, 3], height: 1.5, rise: { axis: 'x', to: 0 } },
      { at: [5, 1], size: [3, 14] },
      { at: [-4, 6], size: [8, 3], surface: GolfSurfaces.Water },
      { at: [-4, 9], size: [9, 6] },
    ],
    blocks: [{ at: [-2.5, 11.5], size: [5, 0.4] }],
    bumpers: [{ at: [3, 12], radius: 0.35 }],
    orbs: [
      [3.5, 2.5],
      [6.5, 8],
    ],
  },
  // Narrow gorge, pools to slip past and a bar
  {
    tee: [0, 0],
    cup: [-7.5, 15.5],
    pads: [
      { at: [-1.5, -1.5], size: [5.5, 3] },
      { at: [4, -1.5], size: [3, 4.5] },
      { at: [4, 3], size: [1.5, 3], surface: GolfSurfaces.Water },
      { at: [5.5, 3], size: [1.5, 3] },
      { at: [4, 6], size: [3, 4] },
      { at: [-6, 7], size: [10, 3] },
      { at: [-9, 7], size: [3, 4] },
      { at: [-9, 11], size: [1.5, 2], surface: GolfSurfaces.Water },
      { at: [-7.5, 11], size: [1.5, 2] },
      { at: [-9, 13], size: [3, 4] },
    ],
    spinners: [{ at: [-1, 8.5], length: 2.6, speed: 2.2 }],
    orbs: [
      [2, 0],
      [5.5, 8.5],
      [-4, 8.5],
    ],
  },
  // Two jumps and a boost
  {
    tee: [0, 0],
    cup: [20, 16.5],
    pads: [
      { at: [-1.5, -1.5], size: [3, 6.5] },
      { at: [-1.5, 5], size: [3, 4], surface: GolfSurfaces.Boost, push: [0, 1] },
      { at: [-1.5, 9], size: [3, 2], rise: { axis: 'z', to: 0.6 }, open: 'n' },
      { at: [-3, 13.5], size: [6, 5.5], open: 's' },
      { at: [3, 15], size: [9, 3] },
      { at: [12, 15], size: [2, 3], rise: { axis: 'x', to: 0.6 }, open: 'e' },
      { at: [16.2, 13], size: [5.8, 7], open: 'w' },
    ],
    bumpers: [
      { at: [18.5, 15], radius: 0.35 },
      { at: [18.5, 18], radius: 0.35 },
    ],
    orbs: [
      [0, 3],
      [7, 16.5],
    ],
  },
]
