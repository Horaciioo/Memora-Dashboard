import {
  LUDO_LAYOUT,
  LUDO_SEATING,
  LUDO_STAR,
  LUDO_STAR_SEATING,
  LUDO_STAR_VIEWER_CORNER,
  LUDO_VIEWER_CORNER,
} from '@/declarations/play/ludo/board'
import type { LudoCell } from '@/declarations/play/ludo/board'

// Degrees to radians
const DEGREE = Math.PI / 180
// Arms of the star, and degrees from one to the next
const ARMS = 6
const ARM_TURN = 360 / ARMS

/**
 * A board a game is played on
 * @typedef {Object} LudoMap
 */

export interface LudoMap {
  name: 'cross' | 'star'
  // Colours on the board
  corners: number
  // Cells per side of the drawing
  size: number
  // Squares of one corner's quarter, and around the board
  quarter: number
  length: number
  // Steps on the track before the lane, and the step of a pawn at home
  lap: number
  goal: number
  // Star square after each start
  starOffset: number
  // Track square centres, and the way each tile faces in degrees
  track: readonly LudoCell[]
  angles: readonly number[]
  // First corner's lane, yard spots and home pile, cell units
  lane: readonly LudoCell[]
  yardSpots: readonly LudoCell[]
  goalSpot: LudoCell
  // Corners dealt for each table size, and the one the viewer is turned to
  seating: Record<number, readonly number[]>
  viewerCorner: number
  // Squares nobody is taken on
  safe: ReadonlySet<number>
  // Detours inside the track, by the track square each one stands for
  branch: LudoBranch | null
}

/**
 * Detours of a board: a pawn landing in one's span may take it instead of the track
 * @typedef {Object} LudoBranch
 */

export interface LudoBranch {
  // First and last offsets of a quarter a detour stands for
  first: number
  last: number
  // Centre of the detour tile of each track square, null elsewhere
  points: readonly (LudoCell | null)[]
  // Action kind of each tile, null for a plain one
  kinds: readonly ('bonus' | 'malus' | null)[]
  // Arrow of each arm, standing in front of its detour: where it is and the way it points in degrees
  forks: readonly { point: LudoCell; angle: number }[]
}

/**
 * Point turned about the middle of a drawing, clockwise
 * @param {LudoCell} point - Point, row then column
 * @param {number} degrees - Angle
 * @param {number} size - Cells per side
 * @return {LudoCell} - Turned point
 */

const rotated = ([y, x]: LudoCell, degrees: number, size: number): LudoCell => {
  const middle = size / 2
  const sin = Math.sin(degrees * DEGREE)
  const cos = Math.cos(degrees * DEGREE)
  const [dy, dx] = [y - middle, x - middle]

  return [middle + dx * sin + dy * cos, middle + dx * cos - dy * sin]
}

/**
 * Point on a ray from the middle, the angle counted clockwise from the top
 * @param {number} size - Cells per side
 * @param {number} radius - Distance
 * @param {number} degrees - Angle
 * @return {LudoCell} - Point
 */

export const polarPoint = (size: number, radius: number, degrees: number): LudoCell => [
  size / 2 - radius * Math.cos(degrees * DEGREE),
  size / 2 + radius * Math.sin(degrees * DEGREE),
]

/**
 * Cell turned a quarter clockwise, whole cells
 * @param {LudoCell} cell - Grid cell
 * @param {number} quarters - Quarter turns
 * @return {LudoCell} - Turned cell
 */

const turnCell = ([row, column]: LudoCell, quarters: number): LudoCell => {
  const turns = ((quarters % 4) + 4) % 4
  let cell: LudoCell = [row, column]
  for (let index = 0; index < turns; index += 1) cell = [cell[1], LUDO_LAYOUT.size - 1 - cell[0]]

  return cell
}

/**
 * Squares nobody is taken on, starts and stars
 * @param {number} corners - Colours
 * @param {number} quarter - Squares per quarter
 * @param {number} starOffset - Star square after a start
 * @return {Set<number>} - Squares
 */

const safeOf = (corners: number, quarter: number, starOffset: number): Set<number> =>
  new Set(
    Array.from({ length: corners }, (_, corner) => [
      corner * quarter,
      corner * quarter + starOffset,
    ]).flat()
  )

/**
 * Classic cross, four corners on an eleven cell grid
 * @return {LudoMap} - Map
 */

const crossMap = (): LudoMap => {
  const corners = 4
  const quarter = LUDO_LAYOUT.quarter.length
  const length = corners * quarter
  const lap = length - 1
  const centred = ([row, column]: LudoCell): LudoCell => [row + 0.5, column + 0.5]

  return {
    name: 'cross',
    corners,
    size: LUDO_LAYOUT.size,
    quarter,
    length,
    lap,
    goal: lap + LUDO_LAYOUT.lane.length,
    starOffset: LUDO_LAYOUT.starOffset,
    track: Array.from({ length: corners }, (_, corner) =>
      LUDO_LAYOUT.quarter.map((cell) => centred(turnCell(cell, corner)))
    ).flat(),
    angles: Array.from({ length: length }, () => 0),
    lane: LUDO_LAYOUT.lane.map(centred),
    yardSpots: LUDO_LAYOUT.yardSpots,
    goalSpot: LUDO_LAYOUT.goalSpot,
    seating: LUDO_SEATING,
    viewerCorner: LUDO_VIEWER_CORNER,
    safe: safeOf(corners, quarter, LUDO_LAYOUT.starOffset),
    branch: null,
  }
}

/**
 * Where the star board's arms stand: radius of the track at an arm's middle, and each axis
 * @type {Object}
 */

export const STAR_PARTS = {
  apothem: LUDO_STAR.side * Math.cos(ARM_TURN * 0.5 * DEGREE),
  // Arm axis, clockwise from the top: the first arm sits top left
  axisOf: (corner: number): number => corner * ARM_TURN - ARM_TURN / 2,
}

/**
 * Detour of every arm: tiles spread along a path inside the corner, from the square after the
 * first one it replaces to the square before the last
 * @param {LudoCell[]} ring - Track square centres
 * @param {LudoCell} centre - Middle of the board
 * @return {LudoBranch} - Detours
 */

const branchOf = (ring: LudoCell[], centre: LudoCell): LudoBranch => {
  const { first, last, inset, edge, special } = LUDO_STAR.branch
  const quarter = LUDO_STAR.side
  const count = last - first + 1
  const unit = ([y, x]: LudoCell): LudoCell => {
    const length = Math.hypot(y, x)

    return [y / length, x / length]
  }
  const points: (LudoCell | null)[] = Array.from({ length: ring.length }, () => null)
  const kinds: ('bonus' | 'malus' | null)[] = Array.from({ length: ring.length }, () => null)
  const forks: { point: LudoCell; angle: number }[] = []

  for (let arm = 0; arm < ARMS; arm += 1) {
    // Track squares the path leaves from and comes back to
    const from = ring[(arm * quarter + first) % ring.length]
    const to = ring[(arm * quarter + last + 1) % ring.length]
    const inward = (square: LudoCell): LudoCell => {
      const [y, x] = unit([centre[0] - square[0], centre[1] - square[1]])
      return [y, x]
    }
    // Sides the two squares lie on, turned toward the middle
    const normalOf = (side: number): LudoCell => {
      const [y, x] = polarPoint(0, 1, STAR_PARTS.axisOf(side))
      return [-y, -x]
    }
    const offsetBy = (square: LudoCell, side: number, depth: number): LudoCell => [
      square[0] + normalOf(side)[0] * depth,
      square[1] + normalOf(side)[1] * depth,
    ]

    // Corner of the inner path, in from the arm's vertex
    const vertex = polarPoint(LUDO_STAR.size, LUDO_STAR.side, (arm % ARMS) * ARM_TURN)
    const [bisectY, bisectX] = inward(vertex)
    const turn = inset / Math.cos((ARM_TURN / 2) * DEGREE)
    const corner: LudoCell = [vertex[0] + bisectY * turn, vertex[1] + bisectX * turn]

    // The first and last tiles touch the track, so the fork and the rejoin are real squares
    const path: LudoCell[] = [
      offsetBy(from, arm, edge),
      offsetBy(from, arm, inset),
      corner,
      offsetBy(to, arm + 1, inset),
      offsetBy(to, arm + 1, edge),
    ]
    const legs = path
      .slice(1)
      .map((point, index) => Math.hypot(point[0] - path[index][0], point[1] - path[index][1]))
    const total = legs.reduce((sum, leg) => sum + leg, 0)

    // One more sample than tiles: the first one carries the arrow, the others are the squares
    const samples = Array.from({ length: count + 1 }, (_, index) => {
      let along = (total * index) / count
      let leg = 0
      while (leg < legs.length - 1 && along > legs[leg]) {
        along -= legs[leg]
        leg += 1
      }
      const share = Math.min(1, along / legs[leg])
      const [fromPoint, toPoint] = [path[leg], path[leg + 1]]

      return [
        fromPoint[0] + (toPoint[0] - fromPoint[0]) * share,
        fromPoint[1] + (toPoint[1] - fromPoint[1]) * share,
      ] as LudoCell
    })
    forks.push({
      point: samples[0],
      angle: Math.atan2(samples[1][0] - samples[0][0], samples[1][1] - samples[0][1]) / DEGREE,
    })
    for (let tile = 0; tile < count; tile += 1) {
      const square = arm * quarter + first + tile
      points[square] = samples[tile + 1]
      // Even arms hold a bonus on the middle tiles
      kinds[square] =
        (special as readonly number[]).includes(tile) && arm % 2 === 0 ? 'bonus' : null
    }
  }

  return { first, last, points, kinds, forks }
}

/**
 * Star board, six arms round a hexagon on a larger grid
 * @return {LudoMap} - Map
 */

const starMap = (): LudoMap => {
  const { size, side, lane, yard, yardGap, yardSpot, goalReach } = LUDO_STAR
  const centre: LudoCell = [size / 2, size / 2]
  const quarter = side
  const length = ARMS * quarter
  // The lane leaves from the square just behind the start, so the whole ring is walked
  const lap = length
  const { apothem, axisOf } = STAR_PARTS
  const vertex = (index: number) =>
    polarPoint(size, side, (((index % ARMS) + ARMS) % ARMS) * ARM_TURN)
  // The middle square of an arm sits two squares before its start
  const lead = Math.floor(side / 2) + 2
  const ring = Array.from({ length }, (_, square) => {
    const spot = (square + lead) % length
    const arm = Math.floor(spot / side)
    const [fromY, fromX] = vertex(arm - 1)
    const [toY, toX] = vertex(arm)
    const share = ((spot % side) + 0.5) / side

    return {
      point: [fromY + (toY - fromY) * share, fromX + (toX - fromX) * share] as LudoCell,
      angle: Math.atan2(toY - fromY, toX - fromX) / DEGREE,
    }
  })
  const axis = axisOf(0)
  // The lane runs one square off the axis, so the home pile lines up with its end
  const laneEnd = polarPoint(size, apothem - 1 - lane, axis)
  const shiftAngle = ring[0].angle * DEGREE
  const laneAngle =
    Math.atan2(
      laneEnd[1] + Math.cos(shiftAngle) - size / 2,
      -(laneEnd[0] + Math.sin(shiftAngle) - size / 2)
    ) / DEGREE
  const yardMiddle = polarPoint(size, apothem + 0.5 + yardGap + yard / 2, axis)
  const spots: LudoCell[] = [
    [-yardSpot, -yardSpot],
    [-yardSpot, yardSpot],
    [yardSpot, -yardSpot],
    [yardSpot, yardSpot],
  ].map(([y, x]) => {
    const [turnedY, turnedX] = rotated([size / 2 + y, size / 2 + x], axis, size)

    return [yardMiddle[0] - size / 2 + turnedY, yardMiddle[1] - size / 2 + turnedX]
  })

  return {
    name: 'star',
    corners: ARMS,
    size,
    quarter,
    length,
    lap,
    goal: lap + lane,
    starOffset: LUDO_LAYOUT.starOffset,
    track: ring.map((entry) => entry.point),
    angles: ring.map((entry) => entry.angle),
    // Lane runs straight in, one square to the start side of the arm's axis
    lane: Array.from({ length: lane }, (_, index) => {
      const [y, x] = polarPoint(size, apothem - 2 - index, axis)
      const shift = ring[0].angle * DEGREE

      return [y + Math.sin(shift), x + Math.cos(shift)] as LudoCell
    }),
    yardSpots: spots,
    goalSpot: polarPoint(size, goalReach, laneAngle),
    seating: LUDO_STAR_SEATING,
    viewerCorner: LUDO_STAR_VIEWER_CORNER,
    safe: safeOf(ARMS, quarter, LUDO_LAYOUT.starOffset),
    branch: branchOf(
      ring.map((entry) => entry.point),
      centre
    ),
  }
}

/**
 * The two boards
 * @type {Record<string, LudoMap>}
 */

export const LUDO_MAPS = { cross: crossMap(), star: starMap() } as const

/**
 * Board a game is played on, the star in Chaos mode
 * @param {boolean} isChaos - Chaos rule on
 * @return {LudoMap} - Map
 */

export const mapOf = (isChaos: boolean): LudoMap => (isChaos ? LUDO_MAPS.star : LUDO_MAPS.cross)
