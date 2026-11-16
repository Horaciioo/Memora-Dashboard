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
  // Length added to each long straight of a map
  stretch: 500,
  // Grass kept beside the outer kerb
  pad: 120,
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
  // Screen pixels per board unit at most, the track never grows past it
  zoom: 1.9,
  // Camera glide, key steps and page share
  camera: { glideMs: 3000, step: 120, pageShare: 0.8, focusShare: 0.5, phoneFocusShare: 0.5 },
} as const

/**
 * Road features, an esse crosses the road, a kink goes out and back, a snake is two tight esses
 * @type {readonly string[]}
 */

export const STOPGO_FEATURES = ['esse', 'kink', 'snake'] as const

export type StopGoFeature = (typeof STOPGO_FEATURES)[number]

/**
 * Circuit per race distance, the longer the race the fuller the circuit
 * @type {Record<number, { maps: StopGoFeature[][], landmarks: number, scatter: number }>}
 */

export const STOPGO_CIRCUITS: Record<
  number,
  { maps: StopGoFeature[][]; landmarks: number; scatter: number }
> = {
  500: { maps: [['esse'], ['esse']], landmarks: 1, scatter: 22 },
  1000: {
    maps: [['esse'], ['kink', 'esse'], ['esse'], ['esse', 'kink']],
    landmarks: 2,
    scatter: 30,
  },
  1500: {
    maps: [
      ['kink', 'esse'],
      ['snake'],
      ['esse', 'esse'],
      ['kink', 'kink'],
      ['esse', 'kink'],
      ['snake', 'esse'],
    ],
    landmarks: 3,
    scatter: 38,
  },
  2000: {
    maps: [
      ['kink', 'esse'],
      ['snake', 'esse'],
      ['esse', 'kink'],
      ['snake', 'snake'],
      ['kink', 'kink'],
      ['esse', 'snake'],
      ['kink', 'esse', 'esse'],
      ['snake', 'kink'],
    ],
    landmarks: 4,
    scatter: 46,
  },
}

/**
 * Circuit of a distance, the nearest one below when none is written for it
 * @param {number} target - Distance to reach
 * @return {{ maps: StopGoFeature[][], landmarks: number, scatter: number }} - Circuit
 */

export const circuitOf = (target: number) => {
  const keys = Object.keys(STOPGO_CIRCUITS)
    .map(Number)
    .sort((a, b) => a - b)
  const key = [...keys].reverse().find((km) => km <= target) ?? keys[0]

  return STOPGO_CIRCUITS[key]
}

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
  // Tries before a piece is dropped
  tries: 6,
  // Space left between two pieces
  gap: 8,
} as const satisfies {
  scatter: readonly { kind: StopGoDecorKind; weight: number; radius: readonly [number, number] }[]
  landmarks: readonly { kind: StopGoDecorKind; radius: number }[]
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
