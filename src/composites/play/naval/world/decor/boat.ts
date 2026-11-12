import type { DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { extrude, haze, shade, trace } from '@/composites/play/naval/world/pen'
import type { Outline } from '@/composites/play/naval/world/pen'

// Points along each side of a hull
const HULL_STEPS = 14

/**
 * Small wooden boat at rest
 * @typedef {Object} BoatStand
 * @property {number} length - Squares
 * @property {number} angle - Heading
 * @property {string} hull - Paint of the hull
 * @property {string} trim - Paint of the gunwale
 * @property {boolean} [hasCabin] - Little wheelhouse
 * @property {boolean} [hasOars] - Oars shipped along it
 */

export interface BoatStand {
  x: number
  y: number
  length: number
  angle: number
  hull: string
  trim: string
  hasCabin?: boolean
  hasOars?: boolean
}

/**
 * Double ended hull, pointed at both ends
 * @param {BoatStand} boat - Boat
 * @param {number} share - Share of its full size
 * @return {Outline} - Points
 */

const hullOutline = ({ x, y, length, angle }: BoatStand, share: number): Outline => {
  const beam = length * 0.2 * share
  const half = (length / 2) * share
  const side = Array.from({ length: HULL_STEPS + 1 }, (_, step) => {
    const along = (step / HULL_STEPS) * 2 - 1

    return [along * half, (1 - along * along) ** 0.7 * beam] as [number, number]
  })
  const points = [...side, ...side.toReversed().map(([px, py]): [number, number] => [px, -py])]
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]

  return points.map(([px, py]) => [x + px * cos - py * sin, y + px * sin + py * cos])
}

/**
 * Point along a boat, from its stern to its bow
 * @param {BoatStand} boat - Boat
 * @param {number} along - Minus one to one
 * @param {number} across - Minus one to one
 * @return {[number, number]} - Point
 */

const pointOf = (
  { x, y, length, angle }: BoatStand,
  along: number,
  across: number
): [number, number] => {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
  const px = (along * length) / 2
  const py = across * length * 0.2

  return [x + px * cos - py * sin, y + px * sin + py * cos]
}

/**
 * Fishing boat seen from above: shadow, painted hull, gunwale, wooden floor, thwarts
 * @param {DecorScene} scene - Scene
 * @param {BoatStand} boat - Boat
 * @return {void}
 */

export const paintBoat = (scene: DecorScene, boat: BoatStand): void => {
  const { pen, board, look } = scene
  const { land, water, sun } = look
  const shell = hullOutline(boat, 1)
  const lift = liftOf(board, boat.x, boat.y, boat.length * 0.08)
  haze(pen, shell, { colour: look.light.shade, blur: 0.25, dx: -sun[0] * 0.15, dy: -sun[1] * 0.15 })
  haze(pen, shell, { colour: water.foam, blur: 0.12 })
  extrude(pen, { outline: shell, lift, side: shade(boat.hull, -0.35), top: boat.hull })
  pen.fillStyle = boat.trim
  trace(pen, hullOutline(boat, 0.86), lift[0], lift[1])
  pen.fill()
  pen.fillStyle = land.plank
  trace(pen, hullOutline(boat, 0.74), lift[0], lift[1])
  pen.fill()
  pen.strokeStyle = land.woodDark
  pen.lineWidth = boat.length * 0.025
  for (const along of [-0.35, 0.05, 0.4]) {
    const [ax, ay] = pointOf(boat, along, -0.62)
    const [bx, by] = pointOf(boat, along, 0.62)
    pen.beginPath()
    pen.moveTo(ax + lift[0], ay + lift[1])
    pen.lineTo(bx + lift[0], by + lift[1])
    pen.stroke()
  }
  if (boat.hasOars) {
    pen.strokeStyle = land.wood
    pen.lineWidth = boat.length * 0.03
    for (const across of [-0.3, 0.3]) {
      const [ax, ay] = pointOf(boat, -0.5, across)
      const [bx, by] = pointOf(boat, 0.55, across)
      pen.beginPath()
      pen.moveTo(ax + lift[0], ay + lift[1])
      pen.lineTo(bx + lift[0], by + lift[1])
      pen.stroke()
    }
  }
  if (!boat.hasCabin) return
  const [cx, cy] = pointOf(boat, -0.2, 0)
  const cabin = (
    [
      [-0.45, -0.5],
      [0.05, -0.5],
      [0.05, 0.5],
      [-0.45, 0.5],
    ] as const
  ).map(([along, across]) => {
    const [px, py] = pointOf(boat, along, across)

    return [px + lift[0], py + lift[1]] as [number, number]
  })
  extrude(pen, {
    outline: cabin,
    lift: liftOf(board, cx, cy, boat.length * 0.22),
    side: shade(boat.trim, -0.2),
    top: land.whitewash ?? boat.trim,
  })
}
