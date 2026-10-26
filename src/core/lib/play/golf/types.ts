import type { GolfPowerName, GolfSurfaceName } from '@/utils/constants/play'

// Point on the course, x then z
export type GolfPoint = readonly [number, number]

// Course edges, north is toward +z
export type GolfEdge = 'n' | 'e' | 's' | 'w'

/**
 * Walkable slab of a hole, a ramp when it rises
 * @typedef {Object} GolfPadLayout
 */

export interface GolfPadLayout {
  // South west corner
  at: GolfPoint
  // Width along x, depth along z
  size: GolfPoint
  height?: number
  // Height reached on the far edge of the axis
  rise?: { axis: 'x' | 'z'; to: number }
  surface?: GolfSurfaceName
  // Edges without a rail, letters of nesw
  open?: string
  // Boost direction
  push?: GolfPoint
}

/**
 * One hole as drawn in the course file
 * @typedef {Object} GolfHoleLayout
 */

export interface GolfHoleLayout {
  tee: GolfPoint
  cup: GolfPoint
  pads: GolfPadLayout[]
  blocks?: { at: GolfPoint; size: GolfPoint }[]
  bumpers?: { at: GolfPoint; radius: number }[]
  spinners?: { at: GolfPoint; length: number; speed: number; phase?: number }[]
  orbs?: GolfPoint[]
  // Ring in, ring out, exit heading in radians
  portals?: { from: GolfPoint; to: GolfPoint; heading?: number }[]
  vortexes?: { at: GolfPoint; radius: number }[]
  // Blowing zone, push is the wind direction
  fans?: { at: GolfPoint; size: GolfPoint; push: GolfPoint }[]
  // Post rising every period seconds
  totems?: { at: GolfPoint; radius: number; period: number; phase?: number }[]
}

/**
 * Slab ready for physics
 * @typedef {Object} GolfPad
 */

export interface GolfPad {
  x0: number
  x1: number
  z0: number
  z1: number
  // Height at the south west corner, then slope per metre
  h: number
  gx: number
  gz: number
  surface: GolfSurfaceName
  push: GolfPoint | null
}

/**
 * Solid segment, guarding the floor it stands on
 * @typedef {Object} GolfWall
 */

export interface GolfWall {
  ax: number
  az: number
  bx: number
  bz: number
  // Floor height at each end
  fa: number
  fb: number
  // Height above the floor
  top: number
  // Rail, slab side or box side
  kind: 'rail' | 'cliff' | 'block'
  // Outward of the slab guarded
  nx: number
  nz: number
  // End opening onto a neighbour, no corner to close
  cutA?: boolean
  cutB?: boolean
}

/**
 * Round obstacle
 * @typedef {Object} GolfCircle
 */

export interface GolfCircle {
  id: string
  x: number
  z: number
  r: number
}

/**
 * Bar turning on its middle
 * @typedef {Object} GolfSpinner
 */

export interface GolfSpinner {
  x: number
  z: number
  length: number
  // Radians per second
  speed: number
  phase: number
  floor: number
}

/**
 * Pair of rings, the ball comes out of the second
 * @typedef {Object} GolfPortal
 */

export interface GolfPortal {
  id: string
  from: GolfPoint
  to: GolfPoint
  // Exit heading, the entry heading kept when null
  heading: number | null
}

/**
 * Blowing zone
 * @typedef {Object} GolfFan
 */

export interface GolfFan {
  x0: number
  x1: number
  z0: number
  z1: number
  // Unit wind
  push: GolfPoint
}

/**
 * Post up half the time
 * @typedef {Object} GolfTotem
 */

export interface GolfTotem extends GolfCircle {
  period: number
  phase: number
  floor: number
}

/**
 * Rectangle box obstacle
 * @typedef {Object} GolfBlock
 */

export interface GolfBlock {
  x0: number
  x1: number
  z0: number
  z1: number
  floor: number
}

/**
 * Hole ready for physics and drawing
 * @typedef {Object} GolfHole
 */

export interface GolfHole {
  tee: GolfPoint
  cup: GolfPoint
  pads: GolfPad[]
  walls: GolfWall[]
  blocks: GolfBlock[]
  bumpers: GolfCircle[]
  spinners: GolfSpinner[]
  orbs: GolfPoint[]
  portals: GolfPortal[]
  vortexes: GolfCircle[]
  fans: GolfFan[]
  totems: GolfTotem[]
  bounds: { x0: number; x1: number; z0: number; z1: number }
}

/**
 * Power acting on a ball
 * @typedef {Object} GolfEffect
 */

export interface GolfEffect {
  power: GolfPowerName
  // Server ms it wears off
  until?: number
  // Shots left
  shots?: number
  from?: string
}

/**
 * Power laid on the course
 * @typedef {Object} GolfHazard
 */

export interface GolfHazard {
  id: string
  power: GolfPowerName
  x: number
  z: number
  ownerId: string
  until?: number
  lives?: number
  // Server ms laid, drifting ones move from there
  laidAt?: number
  // Drift or wind, metres per second or unit
  vx?: number
  vz?: number
}

/**
 * Ball taking part in a shot
 * @typedef {Object} GolfBallInput
 */

export interface GolfBallInput {
  id: string
  x: number
  z: number
  effects: GolfEffect[]
  // Free hand for an orb
  canPick: boolean
}

/**
 * Everything one shot is played from
 * @typedef {Object} GolfShotInput
 */

export interface GolfShotInput {
  hole: GolfHole
  // Server ms of the stroke
  at: number
  // Server ms the hole opened, the spinner clock
  holeStart: number
  shooterId: string
  angle: number
  power: number
  balls: GolfBallInput[]
  hazards: GolfHazard[]
  // Server ms each orb is back
  orbs: number[]
  collisions: boolean
}

// What a shot can make heard or seen
export type GolfEventKind =
  | 'hit'
  | 'wall'
  | 'ball'
  | 'bumper'
  | 'boost'
  | 'spinner'
  | 'cup'
  | 'lip'
  | 'fall'
  | 'splash'
  | 'orb'
  | 'land'
  | 'portal'
  | 'vortex'
  | 'totem'

/**
 * Moment of a shot
 * @typedef {Object} GolfShotEvent
 */

export interface GolfShotEvent {
  // Frame index
  f: number
  kind: GolfEventKind
  id: string
  // Impact speed, sound volume
  strength: number
}

/**
 * Where a moved ball ends
 * @typedef {Object} GolfBallOutcome
 */

export interface GolfBallOutcome {
  x: number
  z: number
  isHoled: boolean
  hasFallen: boolean
}

/**
 * Played shot
 * @typedef {Object} GolfShotResult
 */

export interface GolfShotResult {
  frameMs: number
  frames: number
  // Centimetre x, z pairs per moved ball
  paths: Record<string, number[]>
  outcomes: Record<string, GolfBallOutcome>
  events: GolfShotEvent[]
  bumperHits: Record<string, number>
  pickups: { id: string; orb: number; at: number }[]
  // Ball sent off by a flash
  flashId: string | null
}
