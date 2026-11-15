import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_TRACK } from '@/declarations/play/stopgo/track'

/**
 * Piece of road, a straight or a quarter turn
 * @typedef {Object} StopGoPiece
 */

export type StopGoPiece =
  { kind: 'line'; length: number } | { kind: 'arc'; turn: 1 | -1; radius: number }

/**
 * Place and heading on the board, heading in degrees, 0 up, clockwise
 * @typedef {Object} StopGoPose
 */

export interface StopGoPose {
  x: number
  y: number
  heading: number
}

/**
 * Quarter of a map
 * @typedef {Object} StopGoPortion
 */

export interface StopGoPortion {
  start: StopGoPose
  pieces: StopGoPiece[]
}

/**
 * Whole track of a race
 * @typedef {Object} StopGoTrackPlan
 */

export interface StopGoTrackPlan {
  target: number
  lanes: number
  // Maps of mapKm each
  maps: StopGoPortion[][]
  // Height of one map
  mapHeight: number
  // Left edge and width of the drawing
  minX: number
  width: number
  // Distance of the outer road from the centre line
  maxOffset: number
  // Bend radius of the centre line
  bendRadius: number
}

const RIGHT = 1
const LEFT = -1
const cache = new Map<string, StopGoTrackPlan>()
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/**
 * Pose after walking a part of a piece
 * @param {StopGoPose} from - Start
 * @param {StopGoPiece} piece - Piece
 * @param {number} share - Part walked, 0 to 1
 * @return {StopGoPose} - End
 */

export const advance = (from: StopGoPose, piece: StopGoPiece, share: number): StopGoPose => {
  const angle = toRadians(from.heading)
  if (piece.kind === 'line') {
    const length = piece.length * share

    return {
      x: from.x + Math.sin(angle) * length,
      y: from.y - Math.cos(angle) * length,
      heading: from.heading,
    }
  }

  const heading = from.heading + piece.turn * share * 90
  const turned = toRadians(heading)
  const centreX = from.x + piece.turn * piece.radius * Math.cos(angle)
  const centreY = from.y + piece.turn * piece.radius * Math.sin(angle)

  return {
    x: centreX - piece.turn * piece.radius * Math.cos(turned),
    y: centreY - piece.turn * piece.radius * Math.sin(turned),
    heading,
  }
}

/**
 * Length of a piece along the centre line
 * @param {StopGoPiece} piece - Piece
 * @return {number} - Length
 */

const lengthOf = (piece: StopGoPiece) =>
  piece.kind === 'line' ? piece.length : (piece.radius * Math.PI) / 2

/**
 * Pieces of the four portions, an odd map is mirrored so the road comes back
 * @param {number} radius - Bend radius
 * @param {1 | -1} side - First bend side
 * @return {StopGoPiece[][]} - Portions
 */

const portionsOf = (radius: number, side: 1 | -1): StopGoPiece[][] => {
  const { lead, run } = STOPGO_TRACK
  const straight = lead + run + (radius * Math.PI) / 2
  const line = (length: number): StopGoPiece => ({ kind: 'line', length })
  const arc = (turn: 1 | -1): StopGoPiece => ({ kind: 'arc', turn, radius })

  return [
    [line(straight)],
    [line(lead), arc(side), line(run)],
    [line(run), arc(side === RIGHT ? LEFT : RIGHT), line(lead)],
    [line(straight)],
  ]
}

/**
 * Offset of a road from the centre line, positive on the right
 * @param {number} lane - Road, from 0
 * @param {number} lanes - Roads side by side
 * @return {number} - Offset
 */

export const offsetOf = (lane: number, lanes: number) =>
  (lane - (lanes - 1) / 2) * STOPGO_TRACK.laneGap

/**
 * Track of a race, roads side by side, built once per size
 * @param {number} target - Distance to reach
 * @param {number} lanes - Roads, 2 to 4
 * @return {StopGoTrackPlan} - Track
 */

export const trackOf = (target: number, lanes: number): StopGoTrackPlan => {
  const key = `${target}:${lanes}`
  const known = cache.get(key)
  if (known) return known

  const maxOffset = offsetOf(lanes - 1, lanes)
  const bendRadius = STOPGO_TRACK.innerRadius + maxOffset
  const maps: StopGoPortion[][] = []
  let pose: StopGoPose = { x: 0, y: 0, heading: 0 }

  for (let index = 0; index < Math.ceil(target / STOPGO_SETTINGS.mapKm); index++) {
    const pieces = portionsOf(bendRadius, index % 2 ? LEFT : RIGHT)
    maps.push(
      pieces.map((portion) => {
        const start = pose
        pose = portion.reduce((at, piece) => advance(at, piece, 1), start)

        return { start, pieces: portion }
      })
    )
  }

  const outer = maxOffset + (STOPGO_TRACK.roadWidth * STOPGO_TRACK.kerbRatio) / 2 + STOPGO_TRACK.pad
  const shift = 2 * (bendRadius + STOPGO_TRACK.run)
  const plan: StopGoTrackPlan = {
    target,
    lanes,
    maps,
    mapHeight: -pose.y / maps.length,
    minX: -outer,
    width: shift + 2 * outer,
    maxOffset,
    bendRadius,
  }
  cache.set(key, plan)

  return plan
}

/**
 * Piece under a distance
 * @param {StopGoTrackPlan} plan - Track
 * @param {number} km - Distance
 * @return {{ start: StopGoPose, piece: StopGoPiece, share: number }} - Piece, its start and the part walked
 */

export const pieceAt = (plan: StopGoTrackPlan, km: number) => {
  const { mapKm } = STOPGO_SETTINGS
  const portionKm = mapKm / STOPGO_TRACK.portions
  const clamped = Math.min(Math.max(km, 0), plan.target)
  const mapIndex = Math.min(plan.maps.length - 1, Math.floor(clamped / mapKm))
  const inMap = clamped - mapIndex * mapKm
  const portionIndex = Math.min(STOPGO_TRACK.portions - 1, Math.floor(inMap / portionKm))
  const { start, pieces } = plan.maps[mapIndex][portionIndex]
  const total = pieces.reduce((sum, piece) => sum + lengthOf(piece), 0)
  let left = ((inMap - portionIndex * portionKm) / portionKm) * total
  let at = start

  for (const piece of pieces) {
    const length = lengthOf(piece)
    if (left <= length || piece === pieces.at(-1)) {
      return { start: at, piece, share: Math.min(left / length, 1) }
    }
    left -= length
    at = advance(at, piece, 1)
  }

  throw new Error('Portion without piece')
}

/**
 * Pose shifted sideways, positive to the right of the heading
 * @param {StopGoPose} pose - Pose on the centre line
 * @param {number} offset - Sideways distance
 * @return {StopGoPose} - Shifted pose
 */

export const shifted = (pose: StopGoPose, offset: number): StopGoPose => {
  const angle = toRadians(pose.heading)

  return {
    x: pose.x + offset * Math.cos(angle),
    y: pose.y + offset * Math.sin(angle),
    heading: pose.heading,
  }
}

/**
 * Pose of a car, the same distance gives the same pose for every reader
 * @param {StopGoTrackPlan} plan - Track
 * @param {number} km - Distance
 * @param {number} lane - Road
 * @return {StopGoPose} - Pose
 */

export const pointAt = (plan: StopGoTrackPlan, km: number, lane: number): StopGoPose => {
  const { start, piece, share } = pieceAt(plan, km)

  return shifted(advance(start, piece, share), offsetOf(lane, plan.lanes))
}

/**
 * Sign of a hundred kilometres, the last one is the finish
 * @param {number} target - Distance to reach
 * @return {{ km: number, isFinish: boolean }[]} - Signs
 */

export const signsOf = (target: number) => {
  const signs = []
  for (let km = STOPGO_SETTINGS.signKm; km < target; km += STOPGO_SETTINGS.signKm) {
    signs.push({ km, isFinish: false })
  }

  return [...signs, { km: target, isFinish: true }]
}

/**
 * Pose beside the outer kerb, on the outside of a bend
 * @param {StopGoTrackPlan} plan - Track
 * @param {number} km - Distance
 * @return {StopGoPose} - Pose, heading kept
 */

export const edgeAt = (plan: StopGoTrackPlan, km: number): StopGoPose => {
  const { start, piece, share } = pieceAt(plan, km)
  const side = piece.kind === 'arc' ? -piece.turn : RIGHT
  const clear = (STOPGO_TRACK.roadWidth * STOPGO_TRACK.kerbRatio) / 2 + STOPGO_TRACK.signClear

  return shifted(advance(start, piece, share), side * (plan.maxOffset + clear))
}

/**
 * SVG outline of one road over a run of maps
 * @param {StopGoTrackPlan} plan - Track
 * @param {number} firstMap - First map
 * @param {number} lastMap - Last map
 * @param {number} lane - Road
 * @return {string} - Path data
 */

export const lanePath = (
  plan: StopGoTrackPlan,
  firstMap: number,
  lastMap: number,
  lane: number
) => {
  const offset = offsetOf(lane, plan.lanes)
  const first = shifted(plan.maps[firstMap][0].start, offset)
  const parts = [`M${first.x.toFixed(1)} ${first.y.toFixed(1)}`]

  for (const { start, pieces } of plan.maps.slice(firstMap, lastMap + 1).flat()) {
    let at = start
    for (const piece of pieces) {
      at = advance(at, piece, 1)
      const end = shifted(at, offset)
      const point = `${end.x.toFixed(1)} ${end.y.toFixed(1)}`
      if (piece.kind === 'line') parts.push(`L${point}`)
      else {
        const radius = piece.radius - piece.turn * offset
        parts.push(
          `A${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 ${piece.turn === RIGHT ? 1 : 0} ${point}`
        )
      }
    }
  }

  return parts.join('')
}
