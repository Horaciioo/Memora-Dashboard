/**
 * Cell of the board grid
 * @typedef {Object} LudoCell
 */

export type LudoCell = readonly [row: number, column: number]

/**
 * Board drawn as the classic cross, the top left corner given, the others turned from it
 * @type {Object}
 */

export const LUDO_LAYOUT = {
  // Cells per side
  size: 11,
  // Yard cells per side
  yard: 4,
  // Track of the first corner, from its start square
  quarter: [
    [4, 1],
    [4, 2],
    [4, 3],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
    [0, 5],
    [0, 6],
  ] as readonly LudoCell[],
  // Coloured lane to the centre
  lane: [
    [5, 1],
    [5, 2],
    [5, 3],
  ] as readonly LudoCell[],
  // Square pointing into the lane
  entry: [5, 0] as LudoCell,
  // Star squares after each start
  starOffset: 5,
  // Pawn spots in the yard, cell units
  yardSpots: [
    [1.35, 1.35],
    [1.35, 2.65],
    [2.65, 1.35],
    [2.65, 2.65],
  ] as readonly LudoCell[],
  // Pawns at home, in the centre triangle
  goalSpots: [
    [5.05, 4.35],
    [5.95, 4.35],
    [5.5, 4.8],
    [5.5, 4.2],
  ] as readonly LudoCell[],
} as const

/**
 * Colour of each corner, clockwise from the top left
 * @type {readonly string[]}
 */

export const LUDO_CORNERS = ['blue', 'red', 'green', 'yellow'] as const

export type LudoCornerName = (typeof LUDO_CORNERS)[number]

/**
 * Corners dealt for each table size, facing ones first
 * @type {Record<number, readonly number[]>}
 */

export const LUDO_SEATING: Record<number, readonly number[]> = {
  1: [0],
  2: [0, 2],
  3: [0, 1, 2],
  4: [0, 1, 2, 3],
}

// Corner the viewer is turned to, bottom right
export const LUDO_VIEWER_CORNER = 2

/**
 * Pips of each die face, cells of a 3 by 3 grid
 * @type {Record<number, readonly number[]>}
 */

export const LUDO_PIPS: Record<number, readonly number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}

/**
 * Spots of pawns sharing a square, cell units, by crowd
 * @type {Record<number, readonly LudoCell[]>}
 */

export const LUDO_CROWDS: Record<number, readonly LudoCell[]> = {
  1: [[0, 0]],
  2: [
    [0, -0.17],
    [0, 0.17],
  ],
  3: [
    [-0.15, -0.17],
    [-0.15, 0.17],
    [0.17, 0],
  ],
  4: [
    [-0.16, -0.17],
    [-0.16, 0.17],
    [0.16, -0.17],
    [0.16, 0.17],
  ],
}

// Pawn size when sharing a square
export const LUDO_CROWD_SCALE = 0.72
// Pawn size at home
export const LUDO_GOAL_SCALE = 0.6
