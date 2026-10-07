import type { OrgNode } from '@/declarations/academy/curriculum/types'

/**
 * Point on the grid of the chart
 * @typedef {Object} OrgPoint
 */

export interface OrgPoint {
  x: number
  y: number
}

/**
 * Size of a part of the chart, on its grid of 160 by 100
 * @type {{ width: number, height: number }}
 */

export const ORG_NODE_SIZE = { width: 36, height: 11 }

/**
 * Radius of the turns of an arrow
 * @type {number}
 */

export const ORG_TURN_RADIUS = 5

/**
 * Room left between an arrow and the part at either end of it
 * @type {number}
 */

export const ORG_ARROW_GAP = 2.5

const distance = (from: OrgPoint, to: OrgPoint): number => Math.hypot(to.x - from.x, to.y - from.y)

/**
 * Path through points, each turn rounded
 * @param {OrgPoint[]} points - Start, turns, end
 * @param {number} radius - Largest radius of a turn
 * @return {string} - SVG path
 */

export const roundedPath = (points: OrgPoint[], radius: number): string => {
  const [first, ...rest] = points
  if (!first) return ''

  let path = `M ${first.x} ${first.y}`

  rest.forEach((point, index) => {
    const before = points[index]!
    const after = rest[index + 1]

    // Last point ends the line, any other one is a turn
    if (!after) {
      path += ` L ${point.x} ${point.y}`
      return
    }

    const reach = Math.min(radius, distance(before, point) / 2, distance(point, after) / 2)
    const enter = {
      x: point.x - ((point.x - before.x) / distance(before, point)) * reach,
      y: point.y - ((point.y - before.y) / distance(before, point)) * reach,
    }
    const leave = {
      x: point.x + ((after.x - point.x) / distance(point, after)) * reach,
      y: point.y + ((after.y - point.y) / distance(point, after)) * reach,
    }
    path += ` L ${enter.x} ${enter.y} Q ${point.x} ${point.y} ${leave.x} ${leave.y}`
  })

  return path
}

/**
 * Pull both ends of a line in, so it stops short of what it joins
 * @param {OrgPoint[]} points - Start, turns, end
 * @param {number} gap - Room to leave at each end
 * @return {OrgPoint[]} - The same line, shorter at both ends
 */

const stopShort = (points: OrgPoint[], gap: number): OrgPoint[] => {
  const first = points[0]!
  const second = points[1]!
  const last = points.at(-1)!
  const before = points.at(-2)!
  const start = distance(first, second)
  const end = distance(before, last)

  return [
    {
      x: first.x + ((second.x - first.x) / start) * gap,
      y: first.y + ((second.y - first.y) / start) * gap,
    },
    ...points.slice(1, -1),
    {
      x: last.x - ((last.x - before.x) / end) * gap,
      y: last.y - ((last.y - before.y) / end) * gap,
    },
  ]
}

/**
 * Points an arrow goes through between two parts, stopping short of both: straight when they line
 * up, otherwise it leaves upright and turns into the side of the target
 * @param {OrgNode} from - Part it leaves
 * @param {OrgNode} to - Part it reaches
 * @param {boolean} [turns] - Leaves upright, then turns
 * @return {OrgPoint[]} - Start, turns, end
 */

export const linkPoints = (from: OrgNode, to: OrgNode, turns = false): OrgPoint[] => {
  const { width, height } = ORG_NODE_SIZE
  const down = to.y > from.y ? 1 : -1

  if (turns) {
    const side = to.x > from.x ? -1 : 1

    return stopShort(
      [
        { x: from.x, y: from.y + (down * height) / 2 },
        { x: from.x, y: to.y },
        { x: to.x + (side * width) / 2, y: to.y },
      ],
      ORG_ARROW_GAP
    )
  }

  return stopShort(
    [
      { x: from.x, y: from.y + (down * height) / 2 },
      { x: to.x, y: to.y - (down * height) / 2 },
    ],
    ORG_ARROW_GAP
  )
}
