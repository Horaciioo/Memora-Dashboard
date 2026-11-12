/**
 * Kinds of decor a map lays in its band
 * @type {Record<string, string>}
 */

export const NavalDecorKinds = {
  Island: 'island',
  Rocks: 'rocks',
  Cliff: 'cliff',
  Volcano: 'volcano',
  Islet: 'islet',
  Harbour: 'harbour',
  Factory: 'factory',
  Rig: 'rig',
  Lighthouse: 'lighthouse',
  Wreck: 'wreck',
  Village: 'village',
  Quay: 'quay',
  Beacon: 'beacon',
  Cove: 'cove',
  Galleon: 'galleon',
  Flotsam: 'flotsam',
  Reef: 'reef',
  Sandbar: 'sandbar',
  Seabed: 'seabed',
} as const

export type NavalDecorKind = (typeof NavalDecorKinds)[keyof typeof NavalDecorKinds]

/**
 * Sides and corners of a board
 * @type {readonly string[]}
 */

export const NavalSides = [
  'north',
  'east',
  'south',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
] as const

export type NavalSide = (typeof NavalSides)[number]

/**
 * Slow growth of strong weapons over a game
 * @typedef {Object} NavalRamp
 * @property {number} everyTurns - Turns between two steps
 * @property {number} step - Weight added per step
 * @property {number} max - Highest multiplier
 */

export interface NavalRamp {
  everyTurns: number
  step: number
  max: number
}

/**
 * What the combat knows of a map
 * @typedef {Object} NavalTheatre
 * @property {number} size - Squares per side
 * @property {number[]} fleet - Ship lengths
 * @property {number} reachScale - Weapon reach multiplier
 * @property {NavalRamp} ramp - Strong weapons growth
 */

export interface NavalTheatre {
  size: number
  fleet: number[]
  reachScale: number
  ramp: NavalRamp
}

// Decor squares on each plain side
export type NavalBand = Record<'north' | 'east' | 'south' | 'west', number>

/**
 * One decor piece in the band
 * @typedef {Object} NavalDecor
 * @property {number} at - Place along the side, 0 to 1
 * @property {number} depth - Place across the band, 0 at the grid
 * @property {number} scale - Size multiplier
 */

export interface NavalDecor {
  kind: NavalDecorKind
  side: NavalSide
  at: number
  depth: number
  scale: number
}

/**
 * What the drawing knows of a map
 * @typedef {Object} NavalMapLook
 */

export interface NavalMapLook {
  band: NavalBand
  // Light direction, x then y
  sun: [number, number]
  light: Record<string, string>
  water: Record<string, string>
  land: Record<string, string>
  decor: NavalDecor[]
  life: Record<string, number>
  // Decor squares added around the sea in a game
  stage: number
  // Thumbnail framing: squares shown, pull towards the first piece
  preview: { span: number; focus: number }
  // Fleet skin key
  fleet: string
}

/**
 * One map of the battle
 * @typedef {Object} NavalMapMeta
 */

export interface NavalMapMeta {
  label: string
  tagline: string
  theatre: NavalTheatre
  look: NavalMapLook
  // Old sea setting it replaces
  legacyFormat?: string
}
