import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { transition: look } = GOLF_SCENE

// Spot in the hole frame
export interface GolfStageSpot {
  x: number
  y: number
  z: number
}

/**
 * Balls carried from one hole to the next, shared inside the canvas
 * @typedef {Object} GolfStage
 */

export interface GolfStage {
  // Seconds since the hole closed, server clock
  seconds: number
  from: Map<string, GolfStageSpot>
  // Order of each hop
  ranks: Map<string, number>
  // Next tee on the same map, none when the course changes
  to: GolfStageSpot | null
}

/**
 * Length of the whole sequence
 * @param {number} players - Balls hopping one after the other
 * @return {number} - Seconds
 */

export const stageLength = (players: number): number =>
  look.prep + look.gather + look.bounce + look.stagger * Math.max(0, players - 1) + look.fly

// Ease in and out
const ease = (share: number): number => share * share * (3 - 2 * share)
const clampShare = (share: number): number => Math.min(1, Math.max(0, share))

/**
 * Ball spot at a moment of the sequence: rest, hop in place, arc to the next tee
 * @param {GolfStageSpot} from - Spot when the hole closed
 * @param {GolfStageSpot | null} to - Next tee, none when the course changes
 * @param {number} seconds - Since the hole closed
 * @param {number} rank - Order of the hop
 * @return {GolfStageSpot} - Spot
 */

export const stageBallSpot = (
  from: GolfStageSpot,
  to: GolfStageSpot | null,
  seconds: number,
  rank: number
): GolfStageSpot => {
  const hopAt = look.prep + look.gather + rank * look.stagger
  const hop = clampShare((seconds - hopAt) / look.bounce)
  const lift = Math.sin(Math.PI * hop) * look.hop
  const flight = to ? clampShare((seconds - hopAt - look.bounce) / look.fly) : 0
  if (!to || flight === 0) return { x: from.x, y: from.y + lift, z: from.z }

  const share = ease(flight)
  return {
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share + Math.sin(Math.PI * flight) * look.arc,
    z: from.z + (to.z - from.z) * share,
  }
}

/**
 * Middle and reach framing a few spots
 * @param {GolfStageSpot[]} spots - Spots
 * @return {{ x: number, z: number, reach: number }} - Frame
 */

export const stageFrame = (spots: GolfStageSpot[]): { x: number; z: number; reach: number } => {
  if (!spots.length) return { x: 0, z: 0, reach: look.minReach }
  const xs = spots.map((spot) => spot.x)
  const zs = spots.map((spot) => spot.z)
  const spread = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs))

  return {
    x: (Math.max(...xs) + Math.min(...xs)) / 2,
    z: (Math.max(...zs) + Math.min(...zs)) / 2,
    reach: Math.max(look.minReach, spread * look.reach),
  }
}
