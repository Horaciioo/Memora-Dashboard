import type { GolfBody } from '@/core/lib/play/golf/body'
import { floorHeight } from '@/core/lib/play/golf/course'
import type {
  GolfCircle,
  GolfEventKind,
  GolfHazard,
  GolfPad,
  GolfShotInput,
  GolfShotResult,
} from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

// Frames between two same sounds
const EVENT_GAP = 2

/**
 * Bumper standing on the course
 * @typedef {Object} GolfBumper
 */

export interface GolfBumper extends GolfCircle {
  floor: number
  // Laid by a player, worn by hits
  hazard: GolfHazard | null
}

/**
 * Running simulation
 * @typedef {Object} GolfWorld
 */

export interface GolfWorld {
  input: GolfShotInput
  bodies: GolfBody[]
  hazards: GolfHazard[]
  bumpers: GolfBumper[]
  orbs: number[]
  cupFloor: number
  // Lost below this height
  voidFloor: number
  // Pairs overlapping at the start, ignored until apart
  exempt: Set<string>
  // Boost slab each ball rolls on
  boosting: Map<string, GolfPad | null>
  frames: number
  events: GolfShotResult['events']
  bumperHits: Record<string, number>
  pickups: GolfShotResult['pickups']
  emit: (kind: GolfEventKind, id: string, strength?: number) => void
}

/**
 * Key of a pair of bodies
 * @param {GolfBody} left - First
 * @param {GolfBody} right - Second
 * @return {string} - Key
 */

export const pairKey = (left: GolfBody, right: GolfBody): string =>
  left.id < right.id ? `${left.id}:${right.id}` : `${right.id}:${left.id}`

/**
 * Pairs touching before the stroke
 * @param {GolfBody[]} bodies - Bodies
 * @return {Set<string>} - Pair keys
 */

const overlapping = (bodies: GolfBody[]): Set<string> => {
  const pairs = new Set<string>()
  bodies.forEach((left, index) => {
    for (const right of bodies.slice(index + 1)) {
      if (Math.hypot(left.x - right.x, left.z - right.z) < left.radius + right.radius) {
        pairs.add(pairKey(left, right))
      }
    }
  })

  return pairs
}

/**
 * Fixed and laid bumpers
 * @param {GolfShotInput} input - Shot
 * @param {GolfHazard[]} hazards - Laid powers
 * @return {GolfBumper[]} - Bumpers
 */

const bumpersOf = (input: GolfShotInput, hazards: GolfHazard[]): GolfBumper[] => {
  const floorOf = (x: number, z: number) => floorHeight(input.hole, x, z) ?? 0

  return [
    ...input.hole.bumpers.map((bumper) => ({
      ...bumper,
      floor: floorOf(bumper.x, bumper.z),
      hazard: null,
    })),
    ...hazards
      .filter((hazard) => hazard.power === GolfPowers.Bumper && (hazard.lives ?? 0) > 0)
      .map((hazard) => ({
        id: hazard.id,
        x: hazard.x,
        z: hazard.z,
        r: GOLF_SETTINGS.powers.bumper.radius,
        floor: floorOf(hazard.x, hazard.z),
        hazard,
      })),
  ]
}

/**
 * Simulation ready to run
 * @param {GolfShotInput} input - Shot
 * @param {GolfBody[]} bodies - Bodies
 * @return {GolfWorld} - World
 */

export const createWorld = (input: GolfShotInput, bodies: GolfBody[]): GolfWorld => {
  const hazards = input.hazards.map((hazard) => ({ ...hazard }))
  const last = new Map<string, number>()
  const world: GolfWorld = {
    input,
    bodies,
    hazards,
    bumpers: bumpersOf(input, hazards),
    orbs: [...input.orbs],
    cupFloor: floorHeight(input.hole, input.hole.cup[0], input.hole.cup[1]) ?? 0,
    voidFloor: Math.min(...input.hole.pads.map((pad) => pad.h)) - GOLF_SETTINGS.physics.voidDepth,
    exempt: overlapping(bodies),
    boosting: new Map(),
    frames: 0,
    events: [],
    bumperHits: {},
    pickups: [],
    emit: (kind, id, strength = 1) => {
      // One sound per contact
      const key = `${kind}:${id}`
      if ((last.get(key) ?? -Infinity) > world.frames - EVENT_GAP) return
      last.set(key, world.frames)
      world.events.push({ f: world.frames, kind, id, strength })
    },
  }

  return world
}
