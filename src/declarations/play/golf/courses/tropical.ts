import type { GolfHoleLayout } from '@/core/lib/play/golf/types'

/**
 * Les Tropiques, six holes of fans and bridges
 * @type {GolfHoleLayout[]}
 */

export const TROPICAL_HOLES: GolfHoleLayout[] = [
  // Pontoon and a narrow bridge
  {
    tee: [0, 0],
    cup: [-15, 2.5],
    pads: [
      { at: [-6, -1.5], size: [7.5, 3] },
      { at: [-12, -0.6], size: [6, 1.2], open: 'ns' },
      { at: [-17, -3], size: [5, 7] },
    ],
    bumpers: [{ at: [-14, 0.5], radius: 0.35 }],
    orbs: [[-3, 0]],
  },
  // Palms in the bends, wind for and against
  {
    tee: [0, 0],
    cup: [-10.5, 13.5],
    pads: [
      { at: [-1.5, -1.5], size: [3, 9.5] },
      { at: [-9, 5], size: [7.5, 3] },
      { at: [-12, 5], size: [3, 10] },
    ],
    fans: [
      { at: [-8, 5], size: [5, 3], push: [-1, 0] },
      { at: [-12, 9], size: [3, 2], push: [0, -1] },
    ],
    bumpers: [
      { at: [-0.6, 2.5], radius: 0.35 },
      { at: [0.6, 5], radius: 0.35 },
    ],
    orbs: [[0, 6.5]],
  },
  // Up the falls, drop to the basin
  {
    tee: [0, 0],
    cup: [13.5, 7.5],
    pads: [
      { at: [-2, -1.5], size: [4, 5.5] },
      { at: [-2, 4], size: [4, 4], rise: { axis: 'z', to: 1 } },
      { at: [-4, 8], size: [8, 4], height: 1 },
      { at: [4, 9], size: [6, 3], height: 1 },
      { at: [10, 6], size: [5, 9] },
    ],
    fans: [{ at: [10, 10], size: [5, 2], push: [0, -1] }],
    orbs: [
      [0, 2],
      [7, 10.5],
    ],
  },
  // Bamboo maze
  {
    tee: [-4.5, 0],
    cup: [4.5, 14.5],
    pads: [{ at: [-6, -1.5], size: [12, 17.5] }],
    blocks: [
      { at: [-6, 4], size: [8.5, 0.4] },
      { at: [-2.5, 8.5], size: [8.5, 0.4] },
      { at: [-6, 12.5], size: [8.5, 0.4] },
    ],
    fans: [
      { at: [2.5, 3.5], size: [3.5, 1.5], push: [-1, 0] },
      { at: [-6, 8], size: [3.5, 1.5], push: [1, 0] },
    ],
    bumpers: [{ at: [0, 10.5], radius: 0.4 }],
    orbs: [
      [4, 1],
      [-4, 6.5],
      [0, 14.5],
    ],
  },
  // Windy plank or the long boardwalk
  {
    tee: [0, 0],
    cup: [6, 13],
    pads: [
      { at: [-3, -3], size: [6, 6] },
      { at: [-0.6, 3], size: [1.2, 7], open: 'ew' },
      { at: [3, -0.6], size: [8.4, 1.2], open: 'ns' },
      { at: [11.4, -0.6], size: [1.2, 10.6], open: 'ew' },
      { at: [-3, 10], size: [17, 6] },
    ],
    blocks: [{ at: [2.5, 10.8], size: [0.4, 3.6] }],
    orbs: [
      [0, 6.5],
      [12, 5],
    ],
  },
  // Up the volcano round its flanks
  {
    tee: [-4.5, -4.5],
    cup: [0, 0],
    pads: [
      { at: [-6, -6], size: [12, 3.5] },
      { at: [2.5, -2.5], size: [3.5, 5], rise: { axis: 'z', to: 0.6 } },
      { at: [-6, 2.5], size: [12, 3.5], height: 0.6 },
      { at: [-6, -0.5], size: [3.5, 3], height: 1.2, rise: { axis: 'z', to: 0.6 } },
      { at: [-6, -2.5], size: [3.5, 2], height: 1.2 },
      { at: [-2.5, -2.5], size: [5, 5], height: 1.2 },
    ],
    fans: [{ at: [-2, 2.5], size: [4, 3.5], push: [1, 0] }],
    orbs: [
      [4.5, -4.5],
      [0, 4.25],
    ],
  },
]
