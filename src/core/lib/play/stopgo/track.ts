import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_TRACK, circuitOf } from '@/declarations/play/stopgo/track'
import type { StopGoFeature } from '@/declarations/play/stopgo/track'

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
 * Pieces of one feature, `way` is the side the road moves toward
 * @param {StopGoFeature} feature - Feature
 * @param {number} radius - Bend radius
 * @param {1 | -1} way - Side to move toward
 * @return {{ pieces: StopGoPiece[], flips: boolean, height: number }} - Pieces, side change, climb
 */

const featureOf = (feature: StopGoFeature, radius: number, way: 1 | -1) => {
  const { lead, run } = STOPGO_TRACK
  const back = way === RIGHT ? LEFT : RIGHT
  const line = (length: number): StopGoPiece => ({ kind: 'line', length })
  const arc = (turn: 1 | -1): StopGoPiece => ({ kind: 'arc', turn, radius })
  const esse = [arc(way), line(2 * run), arc(back)]

  if (feature === 'esse') {
    return { pieces: [line(lead), ...esse, line(lead)], flips: true, height: 2 * lead + 2 * radius }
  }
  if (feature === 'kink') {
    return {
      pieces: [line(lead), arc(way), arc(back), line(lead), arc(back), arc(way), line(lead)],
      flips: false,
      height: 3 * lead + 4 * radius,
    }
  }

  return {
    pieces: [line(lead), ...esse, arc(back), line(2 * run), arc(way), line(lead)],
    flips: false,
    height: 2 * lead + 4 * radius,
  }
}

/**
 * Cuts the pieces of a map into portions of the same length, a bend stays whole
 * @param {StopGoPiece[]} pieces - Pieces of the map
 * @return {StopGoPiece[][]} - Portions
 */

const portionsOf = (pieces: StopGoPiece[]): StopGoPiece[][] => {
  const count = STOPGO_TRACK.portions
  const quarter = pieces.reduce((sum, piece) => sum + lengthOf(piece), 0) / count
  const portions: StopGoPiece[][] = Array.from({ length: count }, () => [])
  let walked = 0

  for (const piece of pieces) {
    const length = lengthOf(piece)
    if (piece.kind === 'arc') {
      portions[Math.min(count - 1, Math.floor((walked + length / 2) / quarter))].push(piece)
      walked += length
      continue
    }

    let left = length
    while (left > 0.001) {
      const index = Math.min(count - 1, Math.floor((walked + 0.001) / quarter))
      const take = index === count - 1 ? left : Math.min(left, (index + 1) * quarter - walked)
      portions[index].push({ kind: 'line', length: take })
      walked += take
      left -= take
    }
  }

  return portions.map((portion) => (portion.length ? portion : [{ kind: 'line', length: 0.001 }]))
}

/**
 * Pieces of one map, the features spread over a straight road that always ends upright
 * @param {StopGoFeature[]} features - Features, in order
 * @param {number} radius - Bend radius
 * @param {1 | -1} start - Side the map starts on, RIGHT means moving right first
 * @return {{ portions: StopGoPiece[][], end: 1 | -1 }} - Portions and the side the map ends on
 */

const mapOf = (features: StopGoFeature[], radius: number, start: 1 | -1) => {
  const { lead, run, stretch } = STOPGO_TRACK
  const total = 2 * (lead + run + (radius * Math.PI) / 2 + stretch) + 2 * lead + 2 * radius
  const pieces: StopGoPiece[] = []
  const built: ReturnType<typeof featureOf>[] = []
  let way = start
  let climb = 0

  for (const feature of features) {
    const made = featureOf(feature, radius, way)
    if (climb + made.height > total) break
    built.push(made)
    climb += made.height
    if (made.flips) way = way === RIGHT ? LEFT : RIGHT
  }

  const gap = (total - climb) / (built.length + 1)
  const line = (length: number): StopGoPiece => ({ kind: 'line', length })
  for (const made of built) pieces.push(line(gap), ...made.pieces)
  pieces.push(line(gap))

  return { portions: portionsOf(pieces), end: way }
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
  const circuit = circuitOf(target)
  let pose: StopGoPose = { x: 0, y: 0, heading: 0 }
  let side: 1 | -1 = RIGHT

  for (let index = 0; index < Math.ceil(target / STOPGO_SETTINGS.mapKm); index++) {
    const { portions, end } = mapOf(circuit.maps[index % circuit.maps.length], bendRadius, side)
    side = end
    maps.push(
      portions.map((portion) => {
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
