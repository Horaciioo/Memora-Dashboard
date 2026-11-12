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
  // Foot of the pile of pawns at home, in the centre triangle
  goalSpot: [5.5, 4.75] as LudoCell,
} as const

/**
 * Star board of the Chaos mode: six arms around a hexagon, units are cells
 * @type {Object}
 */

export const LUDO_STAR = {
  // Cells per side of the drawing
  size: 25,
  // Squares along one arm, odd so the middle one sits on the axis
  side: 9,
  // Coloured lane squares to the centre
  lane: 3,
  // Yard side, and its gap to the track
  yard: 3.8,
  yardGap: 0.15,
  // Pawn spots of the yard from its middle
  yardSpot: 0.65,
  // Centre triangle: where its base lies, half its width, and the foot of the pile at home
  wedge: { base: 3.3, half: 1.5 },
  goalReach: 1.4,
  // Detour of each arm: it stands for the squares from the first to the last offset of the quarter,
  // the start square included, sits this far inside the track (its end tiles touching it, at the edge distance), and carries action squares at these tile numbers
  branch: { first: 0, last: 5, inset: 2, edge: 1, special: [2, 3] },
  // Soft plate under the track, its margin round the tiles
  plate: 0.6,
  // Rounded square of a track tile
  tile: { gap: 0.1, radius: 0.3 },
} as const

/**
 * Colour of each corner, clockwise from the top left
 * @type {readonly string[]}
 */

export const LUDO_CORNERS = ['blue', 'red', 'green', 'yellow', 'purple', 'teal'] as const

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

/**
 * Arms dealt on the star for each table size, facing ones first
 * @type {Record<number, readonly number[]>}
 */

export const LUDO_STAR_SEATING: Record<number, readonly number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
}

// Corner the viewer is turned to, bottom right
export const LUDO_VIEWER_CORNER = 2

// Arm the viewer is turned to on the star, bottom right as well
export const LUDO_STAR_VIEWER_CORNER = 3

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
// Pawn size at home, and the rise of each pawn in the pile, cell units
export const LUDO_GOAL_SCALE = 0.62
export const LUDO_PILE_RISE = 0.2
