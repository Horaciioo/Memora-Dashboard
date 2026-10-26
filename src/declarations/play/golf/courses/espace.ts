import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * L’Espace, six holes of portals, black holes and totems
 * @type {GolfHoleLayout[]}
 */

export const ESPACE_HOLES: GolfHoleLayout[] = [
  // No rails in orbit
  {
    tee: [0, 0],
    cup: [1.5, 13.5],
    pads: [
      { at: [-2, -2], size: [4, 6], open: 'ew' },
      { at: [-1, 4], size: [2, 6], open: 'ew' },
      { at: [-3, 10], size: [6, 5], open: 'new' },
    ],
    totems: [{ at: [0, 7], radius: 0.45, period: 3 }],
    vortexes: [{ at: [-1, 12.5], radius: 0.8 }],
    orbs: [[0, 2]],
  },
  // Portal jump or the thin bridge
  {
    tee: [0, 0],
    cup: [12.5, 8.5],
    pads: [
      { at: [-2, -2], size: [4, 8] },
      { at: [2, 0], size: [6, 1], open: 'ns' },
      { at: [8, -1], size: [6, 11] },
    ],
    portals: [{ from: [0, 4.5], to: [9.5, 5.5], heading: 0 }],
    totems: [{ at: [11, 7], radius: 0.45, period: 3 }],
    orbs: [[5, 0.5]],
  },
  // Asteroid belt
  {
    tee: [0, 0],
    cup: [13.5, 11],
    pads: [
      { at: [-3, -2], size: [6, 16] },
      { at: [3, 8], size: [12, 6] },
    ],
    vortexes: [
      { at: [0, 6], radius: 1 },
      { at: [7, 11], radius: 0.9 },
    ],
    bumpers: [
      { at: [-1.5, 10], radius: 0.4 },
      { at: [1.5, 12], radius: 0.4 },
      { at: [10, 9.5], radius: 0.4 },
      { at: [10, 12.5], radius: 0.4 },
    ],
    orbs: [
      [-2, 3],
      [5, 9],
    ],
  },
  // Gates of totems, west
  {
    tee: [0, 0],
    cup: [-16, 6.5],
    pads: [
      { at: [-14, -1.5], size: [16, 3] },
      { at: [-18, -1.5], size: [4, 9.5], open: 'w' },
    ],
    totems: [
      { at: [-3, -0.75], radius: 0.45, period: 3 },
      { at: [-3, 0.75], radius: 0.45, period: 3, phase: Math.PI },
      { at: [-7, 0], radius: 0.5, period: 4 },
      { at: [-11, -0.75], radius: 0.45, period: 2.5 },
      { at: [-11, 0.75], radius: 0.45, period: 2.5, phase: Math.PI },
    ],
    orbs: [[-5, 0]],
  },
  // Round the black hole
  {
    tee: [0, 0],
    cup: [0, 14],
    pads: [{ at: [-6, -2], size: [12, 18] }],
    vortexes: [{ at: [0, 7], radius: 2 }],
    blocks: [
      { at: [-6, 3.5], size: [3.5, 0.4] },
      { at: [2.5, 3.5], size: [3.5, 0.4] },
      { at: [-2, 11], size: [4, 0.4] },
    ],
    totems: [
      { at: [-4.5, 9], radius: 0.45, period: 3 },
      { at: [4.5, 9], radius: 0.45, period: 3, phase: Math.PI },
    ],
    portals: [{ from: [-5, 0], to: [5, 13], heading: Math.PI }],
    orbs: [
      [4.5, 1],
      [-4.5, 13],
    ],
  },
  // The station: ice bridge, boost lane, guarded cup
  {
    tee: [0, 0],
    cup: [13, 13],
    pads: [
      { at: [-2, -2], size: [4, 7] },
      { at: [-0.6, 5], size: [1.2, 7], open: 'ew', surface: GolfSurfaces.Ice },
      { at: [-4, 12], size: [8, 5], open: 'nw' },
      { at: [4, 13], size: [6, 2], open: 'ns', surface: GolfSurfaces.Boost, push: [1, 0] },
      { at: [10, 9], size: [6, 9], open: 'nes' },
    ],
    portals: [{ from: [-1.5, 3.5], to: [11, 16.5], heading: Math.PI / 2 }],
    vortexes: [{ at: [-2, 15], radius: 0.8 }],
    totems: [
      { at: [12, 11.5], radius: 0.4, period: 3 },
      { at: [14, 14.5], radius: 0.4, period: 3, phase: Math.PI },
    ],
    orbs: [
      [1.5, 2],
      [2, 14],
    ],
  },
]
