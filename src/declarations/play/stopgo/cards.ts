/**
 * Hazard kinds
 * @type {Record<string, string>}
 */

export const StopGoHazardKinds = {
  // Traffic light
  Light: 'light',
  // Speed limit
  Limit: 'limit',
  // Car breakdown
  Breakdown: 'breakdown',
} as const

export type StopGoHazardKind = (typeof StopGoHazardKinds)[keyof typeof StopGoHazardKinds]

/**
 * Card families
 * @type {Record<string, string>}
 */

export const StopGoFamilies = {
  Distance: 'distance',
  Attack: 'attack',
  Remedy: 'remedy',
  Bonus: 'bonus',
} as const

export type StopGoFamily = (typeof StopGoFamilies)[keyof typeof StopGoFamilies]

/**
 * Who a card aims at
 * @type {Record<string, string>}
 */

export const StopGoTargets = {
  None: 'none',
  One: 'one',
  Many: 'many',
} as const

export type StopGoTarget = (typeof StopGoTargets)[keyof typeof StopGoTargets]

/**
 * Hazard pairs, name equals the attack card key
 * @type {Object}
 */

export const STOPGO_HAZARDS = {
  red: { kind: StopGoHazardKinds.Light, remedy: 'green' },
  limit: { kind: StopGoHazardKinds.Limit, remedy: 'unlimit' },
  fuel: { kind: StopGoHazardKinds.Breakdown, remedy: 'petrol' },
  flat: { kind: StopGoHazardKinds.Breakdown, remedy: 'spare' },
  crash: { kind: StopGoHazardKinds.Breakdown, remedy: 'repair' },
} as const

export type StopGoHazard = keyof typeof STOPGO_HAZARDS

export const STOPGO_HAZARD_KEYS = Object.keys(STOPGO_HAZARDS) as StopGoHazard[]

/**
 * Card shape
 * @typedef {Object} StopGoCardSpec
 * @property {StopGoFamily} family - Card family
 * @property {StopGoTarget} target - Aimed at
 * @property {number} [km] - Distance value
 * @property {StopGoHazard} [hazard] - Posed or lifted
 */

export interface StopGoCardSpec {
  family: StopGoFamily
  target: StopGoTarget
  km?: number
  hazard?: StopGoHazard
}

const distance = (km: number): StopGoCardSpec => ({
  family: StopGoFamilies.Distance,
  target: StopGoTargets.None,
  km,
})

const attack = (
  hazard: StopGoHazard,
  target: StopGoTarget = StopGoTargets.One
): StopGoCardSpec => ({
  family: StopGoFamilies.Attack,
  target,
  hazard,
})

const remedy = (hazard: StopGoHazard): StopGoCardSpec => ({
  family: StopGoFamilies.Remedy,
  target: StopGoTargets.None,
  hazard,
})

const bonus = (target: StopGoTarget): StopGoCardSpec => ({
  family: StopGoFamilies.Bonus,
  target,
})

/**
 * Card catalogue
 * @type {Record<string, StopGoCardSpec>}
 */

export const STOPGO_CARDS = {
  km25: distance(25),
  km50: distance(50),
  km75: distance(75),
  km100: distance(100),
  km200: distance(200),
  red: attack('red'),
  limit: attack('limit'),
  fuel: attack('fuel'),
  flat: attack('flat'),
  crash: attack('crash', StopGoTargets.Many),
  green: remedy('red'),
  unlimit: remedy('limit'),
  petrol: remedy('fuel'),
  spare: remedy('flat'),
  repair: remedy('crash'),
  goodDraw: bonus(StopGoTargets.None),
  mystery: bonus(StopGoTargets.One),
} satisfies Record<string, StopGoCardSpec>

export type StopGoCardKey = keyof typeof STOPGO_CARDS

export const STOPGO_CARD_KEYS = Object.keys(STOPGO_CARDS) as StopGoCardKey[]

/**
 * Jokers, one token each
 * @type {Record<string, string>}
 */

export const StopGoJokers = {
  Immunity: 'immunity',
  Cleanup: 'cleanup',
} as const

export type StopGoJoker = (typeof StopGoJokers)[keyof typeof StopGoJokers]
