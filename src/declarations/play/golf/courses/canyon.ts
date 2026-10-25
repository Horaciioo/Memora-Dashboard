import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Le Canyon, six holes over water and cliffs
 * @type {GolfHoleLayout[]}
 */

export const CANYON_HOLES: GolfHoleLayout[] = [
  // Shortcut along the water
  {
    par: 3,
    tee: [0, 0],
    cup: [2.5, 10.5],
    pads: [
      { at: [-1.5, -1.5], size: [3, 6] },
      { at: [1.5, 2], size: [2.5, 6], surface: GolfSurfaces.Water },
      { at: [-1.5, 4.5], size: [3, 3.5] },
      { at: [-1.5, 8], size: [5.5, 4] },
    ],
    orbs: [[0, 6]],
  },
  // Narrow bridge to the island
  {
    par: 3,
    tee: [0, 0],
    cup: [0, 11],
    pads: [
      { at: [-1.5, -1.5], size: [3, 5] },
      { at: [-0.6, 3.5], size: [1.2, 5], open: 'ew' },
      { at: [-2.5, 8.5], size: [5, 5], open: 'new' },
    ],
    orbs: [
      [-0.9, 1.5],
      [0.9, 1.5],
    ],
  },
  // Switchback down the cliffs
  {
    par: 4,
    tee: [0, 0],
    cup: [0.5, 12.3],
    pads: [
      { at: [-1.5, -1.5], size: [3, 5], height: 1.2 },
      { at: [1.5, 0.5], size: [5, 3], height: 1.2, rise: { axis: 'x', to: 0.4 } },
      { at: [6.5, -1.5], size: [3, 8], height: 0.4 },
      {
        at: [6.5, 6.5],
        size: [3, 4],
        height: 0.4,
        rise: { axis: 'z', to: 0 },
        surface: GolfSurfaces.Ice,
      },
      { at: [-1, 10.5], size: [10.5, 3.5] },
    ],
    spinners: [{ at: [4.2, 12.25], length: 2.4, speed: 2.2 }],
    orbs: [[8, 2]],
  },
  // Pinball table
  {
    par: 3,
    tee: [0, 0],
    cup: [0, 11.5],
    pads: [{ at: [-4, -1.5], size: [8, 14.5] }],
    bumpers: [
      { at: [-2, 4], radius: 0.4 },
      { at: [0, 5.5], radius: 0.4 },
      { at: [2, 4], radius: 0.4 },
      { at: [-1, 8], radius: 0.35 },
      { at: [1, 8], radius: 0.35 },
      { at: [-2.6, 10], radius: 0.35 },
      { at: [2.6, 10], radius: 0.35 },
    ],
    orbs: [
      [-3, 2],
      [3, 2],
    ],
  },
  // Twin bars then the open plateau
  {
    par: 4,
    tee: [0, 0],
    cup: [0, 14.5],
    pads: [
      { at: [-1.5, -1.5], size: [3, 9] },
      { at: [-1.5, 7.5], size: [3, 3], rise: { axis: 'z', to: 0.8 } },
      { at: [-3, 10.5], size: [6, 6], height: 0.8, open: 'n' },
    ],
    blocks: [{ at: [-0.9, 12.6], size: [1.8, 0.4] }],
    spinners: [
      { at: [0, 2.5], length: 2.6, speed: 2.5 },
      { at: [0, 5.5], length: 2.6, speed: -2.5, phase: 0.8 },
    ],
    orbs: [[-2, 13]],
  },
  // Off the ledge, around the pond
  {
    par: 4,
    tee: [0, 0],
    cup: [0, 14],
    pads: [
      { at: [-1.5, -1.5], size: [3, 8], height: 1.5 },
      { at: [-4, 6.5], size: [8, 2], height: 0.5 },
      { at: [-4, 8.5], size: [2.5, 3], height: 0.5 },
      { at: [-1.5, 8.5], size: [3, 3], height: 0.5, surface: GolfSurfaces.Water },
      { at: [1.5, 8.5], size: [2.5, 3], height: 0.5 },
      { at: [-4, 11.5], size: [8, 4], height: 0.5 },
    ],
    orbs: [
      [-2.75, 10],
      [2.75, 10],
    ],
  },
]
