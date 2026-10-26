import { Path, Shape, ShapeGeometry } from 'three'

import { padHeight } from '@/core/lib/play/golf'
import type { GolfPad, GolfPoint } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { cup, sink } = GOLF_SCENE
const { cupRadius } = GOLF_SETTINGS.physics

// Point in space
type Vertex = [number, number, number]

// Outer edge of the funnel
const LIP = cupRadius * cup.lip

/**
 * Ring of points round the cup
 * @param {GolfPoint} centre - Cup
 * @param {number} radius - Ring radius
 * @return {GolfPoint[]} - Points on the ground
 */

const ringOf = ([cx, cz]: GolfPoint, radius: number): GolfPoint[] =>
  Array.from({ length: cup.segments }, (_, index) => {
    const angle = (index / cup.segments) * Math.PI * 2

    return [cx + Math.sin(angle) * radius, cz + Math.cos(angle) * radius]
  })

/**
 * Triangles of the band between two rings
 * @param {Vertex[]} upper - Upper ring
 * @param {Vertex[]} lower - Lower ring
 * @return {number[]} - Triangle positions
 */

const band = (upper: Vertex[], lower: Vertex[]): number[] =>
  upper.flatMap((a, index) => {
    const next = (index + 1) % upper.length

    return [...a, ...upper[next], ...lower[next], ...a, ...lower[next], ...lower[index]]
  })

/**
 * Slab wide enough to hold the whole funnel
 * @param {GolfPad} pad - Slab
 * @param {GolfPoint} centre - Cup
 * @return {boolean} - Holds the cup
 */

export const holdsCup = (pad: GolfPad, [x, z]: GolfPoint): boolean =>
  x - LIP > pad.x0 && x + LIP < pad.x1 && z - LIP > pad.z0 && z + LIP < pad.z1

/**
 * Slab top with the funnel opening cut out
 * @param {GolfPad} pad - Slab
 * @param {GolfPoint} centre - Cup
 * @return {number[]} - Triangle positions
 */

export const holedTop = (pad: GolfPad, centre: GolfPoint): number[] => {
  const outline = new Shape()
  outline.moveTo(pad.x0, pad.z0)
  outline.lineTo(pad.x1, pad.z0)
  outline.lineTo(pad.x1, pad.z1)
  outline.lineTo(pad.x0, pad.z1)
  const [first, ...rest] = ringOf(centre, LIP)
  const opening = new Path()
  opening.moveTo(...first)
  for (const spot of rest) opening.lineTo(...spot)
  outline.holes.push(opening)

  // Flat triangles lifted onto the slab
  const flat = new ShapeGeometry(outline)
  const corners = flat.getAttribute('position')
  const positions = Array.from(flat.getIndex()?.array ?? []).flatMap((corner) => {
    const [x, z] = [corners.getX(corner), corners.getY(corner)]

    return [x, padHeight(pad, x, z), z]
  })
  flat.dispose()

  return positions
}

/**
 * Funnel, wall and floor of the pit under the cup
 * @param {GolfPad} pad - Slab
 * @param {GolfPoint} centre - Cup
 * @return {{ funnel: number[], wall: number[], floor: number[] }} - Triangle positions
 */

export const pitFaces = (pad: GolfPad, centre: GolfPoint) => {
  const [cx, cz] = centre
  const rim = padHeight(pad, cx, cz)
  const lip = ringOf(centre, LIP).map(([x, z]): Vertex => [x, padHeight(pad, x, z), z])
  const neck = ringOf(centre, cupRadius).map(([x, z]): Vertex => [x, rim - cup.funnel, z])
  const base = neck.map(([x, , z]): Vertex => [x, rim - sink.depth, z])

  return {
    funnel: band(lip, neck),
    wall: band(neck, base),
    floor: base.flatMap((a, index) => [
      ...a,
      ...base[(index + 1) % base.length],
      cx,
      rim - sink.depth,
      cz,
    ]),
  }
}
