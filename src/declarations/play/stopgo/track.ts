/**
 * Track measures, in board units
 * @type {Object}
 */

export const STOPGO_TRACK = {
  // Centre to centre of two roads
  laneGap: 120,
  roadWidth: 64,
  // Tightest bend radius, kept on the inner road
  innerRadius: 44,
  // Straight run before and after a bend
  lead: 100,
  run: 100,
  // Grass kept beside the outer kerb
  pad: 200,
  // Grass above the finish and below the start
  capHeight: 260,
  // Kerb width over the road width
  kerbRatio: 1.3,
  // Portions in a map, bend portions then straights
  portions: 4,
  // Sign post clearance beside the outer kerb
  signClear: 34,
  // Car move over a gap of km
  move: { perKm: 24, minMs: 1500, maxMs: 5500 },
  // Camera glide, key steps and page share
  camera: { glideMs: 3000, step: 120, pageShare: 0.8, focusShare: 0.5, phoneFocusShare: 0.34 },
} as const

/**
 * Scenery kinds
 * @type {readonly string[]}
 */

export const STOPGO_DECOR_KINDS = ['tree', 'bush', 'rock', 'stand', 'pit', 'lake'] as const

export type StopGoDecorKind = (typeof STOPGO_DECOR_KINDS)[number]

/**
 * Scenery recipe, scattered pieces and one-off landmarks
 * @type {Object}
 */

export const STOPGO_DECOR = {
  scatter: [
    { kind: 'tree', weight: 5, radius: [34, 52] },
    { kind: 'bush', weight: 4, radius: [16, 26] },
    { kind: 'rock', weight: 2, radius: [14, 24] },
  ],
  landmarks: [
    { kind: 'stand', radius: 100 },
    { kind: 'pit', radius: 96 },
    { kind: 'lake', radius: 110 },
  ],
  // Pieces and landmarks per map
  scatterPerMap: 30,
  landmarksPerMap: 2,
  // Tries before a piece is dropped
  tries: 6,
  // Space left between two pieces
  gap: 8,
} as const satisfies {
  scatter: readonly { kind: StopGoDecorKind; weight: number; radius: readonly [number, number] }[]
  landmarks: readonly { kind: StopGoDecorKind; radius: number }[]
  scatterPerMap: number
  landmarksPerMap: number
  tries: number
  gap: number
}

/**
 * Meadow drawn under the road: tufts, flowers and darker patches, per map
 * @type {Object}
 */

export const STOPGO_MEADOW = {
  tufts: 220,
  flowers: 60,
  patches: 14,
  // Flower petal colours
  petals: ['#ffffff', '#ffd84a', '#ff9ec2', '#c9a6ff'],
} as const

/**
 * Board words
 * @type {Object}
 */

export const STOPGO_BOARD_COPY = {
  start: 'Départ',
  finish: 'Arrivée',
  left: 'Parti',
  recenter: 'Recentrer sur ma voiture',
  progress: 'Progression de la course',
} as const
