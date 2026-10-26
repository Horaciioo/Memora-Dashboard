import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * La Plage, six holes of sand, waves and buoys
 * @type {GolfHoleLayout[]}
 */

export const PLAGE_HOLES: GolfHoleLayout[] = [
  // Along the jetty, the sea on the left
  {
    tee: [0, 0],
    cup: [11.5, 8.5],
    pads: [
      { at: [-1.5, -1.5], size: [5.5, 3] },
      { at: [4, -1.5], size: [2, 3], surface: GolfSurfaces.Sand },
      { at: [6, -1.5], size: [4, 3] },
      { at: [-1.5, 1.5], size: [11.5, 2.5], surface: GolfSurfaces.Water },
      { at: [10, -1.5], size: [3, 11.5] },
    ],
    bumpers: [{ at: [11, 4.5], radius: 0.4 }],
    orbs: [[8, 0]],
  },
  // Buoy pinball round the corner
  {
    tee: [0, 0],
    cup: [10.5, 7],
    pads: [
      { at: [-4, -2], size: [8, 12] },
      { at: [4, 4], size: [8, 6] },
    ],
    bumpers: [
      { at: [-2, 3], radius: 0.4 },
      { at: [0, 4.5], radius: 0.4 },
      { at: [2, 3], radius: 0.4 },
      { at: [-1, 7], radius: 0.35 },
      { at: [1.5, 8], radius: 0.35 },
      { at: [6, 6], radius: 0.4 },
      { at: [8, 8.5], radius: 0.35 },
      { at: [8.5, 5], radius: 0.35 },
    ],
    orbs: [
      [-3, 1],
      [3, 1],
    ],
  },
  // Sandbars across the tide
  {
    tee: [0, 0],
    cup: [2, 14.5],
    pads: [
      { at: [-2, -2], size: [4, 5] },
      { at: [-4, 3], size: [5, 3], surface: GolfSurfaces.Water },
      { at: [1, 3], size: [3, 3], surface: GolfSurfaces.Sand },
      { at: [-4, 6], size: [8, 3] },
      { at: [-4, 9], size: [3, 3], surface: GolfSurfaces.Sand },
      { at: [-1, 9], size: [5, 3], surface: GolfSurfaces.Water },
      { at: [-4, 12], size: [8, 4] },
    ],
    bumpers: [{ at: [0, 7.5], radius: 0.35 }],
    orbs: [
      [2.5, 4.5],
      [-2.5, 10.5],
    ],
  },
  // Sandcastle in its moat
  {
    tee: [0, 0],
    cup: [0, 11],
    pads: [
      { at: [-5, -2], size: [10, 8] },
      { at: [-2, 6], size: [4, 2], rise: { axis: 'z', to: 0.8 } },
      { at: [-2, 8], size: [4, 4], height: 0.8 },
      { at: [-5, 6], size: [3, 8], surface: GolfSurfaces.Sand },
      { at: [2, 6], size: [3, 8], surface: GolfSurfaces.Sand },
      { at: [-2, 12], size: [4, 2], surface: GolfSurfaces.Sand },
    ],
    blocks: [{ at: [-0.6, 9.2], size: [1.2, 0.4] }],
    bumpers: [
      { at: [-3.5, 2], radius: 0.4 },
      { at: [3.5, 2], radius: 0.4 },
    ],
    orbs: [
      [-3.5, 10],
      [3.5, 10],
    ],
  },
  // Surf the wave, jump the surf, round the buoys
  {
    tee: [0, 0],
    cup: [10.5, 14],
    pads: [
      { at: [-2, -2], size: [4, 5] },
      { at: [-2, 3], size: [4, 3], surface: GolfSurfaces.Boost, push: [0, 1] },
      { at: [-2, 6], size: [4, 2], rise: { axis: 'z', to: 0.5 }, open: 'n' },
      { at: [-4, 10], size: [8, 6], open: 's' },
      { at: [4, 12], size: [8, 4] },
    ],
    blocks: [{ at: [8.8, 12], size: [0.4, 2.6] }],
    bumpers: [
      { at: [7, 13], radius: 0.35 },
      { at: [6.5, 15], radius: 0.35 },
    ],
    orbs: [
      [0, 1],
      [-2, 13],
    ],
  },
  // Round the lighthouse
  {
    tee: [0, 0],
    cup: [-2.5, 22.5],
    pads: [
      { at: [-2, -2], size: [4, 8] },
      { at: [-2, 6], size: [12, 3] },
      { at: [4, 3], size: [3, 3], surface: GolfSurfaces.Water },
      { at: [7, 9], size: [3, 9] },
      { at: [4, 15], size: [3, 3] },
      { at: [1, 15], size: [3, 3], surface: GolfSurfaces.Sand },
      { at: [-4, 15], size: [5, 3] },
      { at: [-4, 18], size: [3, 6] },
    ],
    spinners: [{ at: [8.5, 12.5], length: 2.6, speed: 2 }],
    blocks: [{ at: [-4, 20], size: [1.6, 0.5] }],
    orbs: [
      [0, 3],
      [8.5, 16.5],
      [-2.5, 19],
    ],
  },
]
