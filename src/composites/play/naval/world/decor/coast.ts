import { circle, paintLamp } from '@/composites/play/naval/world/decor/blocks'
import { paintIslet, paintStone, stoneOutline } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { haze, part, shade, shift, trace } from '@/composites/play/naval/world/pen'
import type { Outline } from '@/composites/play/naval/world/pen'

// Painted bands of the tower
const BANDS = 6

/**
 * Lighthouse on its rock: striped tower, lantern and a soft beam out to sea
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintLighthouse: DecorPainter = (scene) => {
  const { pen, board, look, place, piece, seed } = scene
  const { land, sun } = look
  paintIslet({ ...scene, piece: { ...piece, scale: piece.scale * 0.8 } })
  const rng = pieceRng(seed + 2)
  const rock = liftOf(board, place.x, place.y, 0.9 * piece.scale)
  const foot = { x: place.x - 0.1 + rock[0], y: place.y - 0.2 + rock[1] }
  const tower = liftOf(board, place.x, place.y, 2.6 * piece.scale)
  pen.fillStyle = look.light.shade
  pen.beginPath()
  pen.ellipse(
    foot.x - sun[0] * 1.6,
    foot.y - sun[1] * 1.6,
    0.4,
    0.25,
    Math.atan2(-sun[1], -sun[0]),
    0,
    Math.PI * 2
  )
  pen.fill()
  const ring = circle(foot.x, foot.y, 0.32)
  const steps = Math.ceil(Math.hypot(...tower) * pen.getTransform().a)
  for (let step = 0; step <= steps; step += 1) {
    const share = step / steps
    const band = Math.floor(share * BANDS) % 2
    pen.fillStyle = shade(band ? land.roofWarm : land.concreteLight, -0.2 + share * 0.2)
    trace(pen, ring, ...part(tower, share))
    pen.fill()
  }
  const top = { x: foot.x + tower[0], y: foot.y + tower[1] }
  const beam =
    Math.atan2(place.y - board.height / 2, place.x - board.width / 2) + (rng() - 0.5) * 0.6
  pen.save()
  pen.globalCompositeOperation = 'lighter'
  pen.fillStyle = land.beacon
  pen.beginPath()
  pen.moveTo(top.x, top.y)
  pen.arc(top.x, top.y, 6, beam - 0.22, beam + 0.22)
  pen.closePath()
  pen.fill()
  pen.restore()
  paintLamp(pen, { x: top.x, y: top.y, radius: 0.9, colour: land.lamp })
}

/**
 * Hull outline of a wreck
 * @param {number} x - Centre column
 * @param {number} y - Centre row
 * @param {number} length - Squares
 * @param {number} angle - Heading
 * @return {Outline} - Points
 */

export const hullOf = (x: number, y: number, length: number, angle: number): Outline => {
  const shape: Outline = [
    [-0.5, 0],
    [-0.36, -0.1],
    [0.32, -0.11],
    [0.5, 0],
    [0.32, 0.11],
    [-0.36, 0.1],
  ]
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]

  return shape.map(([px, py]) => [
    x + (px * cos - py * sin) * length,
    y + (px * sin + py * cos) * length,
  ])
}

/**
 * Wreck half sunk: dark shape under the water, a rusted broken hull above, a mast stub and foam
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintWreck: DecorPainter = (scene) => {
  const { pen, board, look, place, piece, seed } = scene
  const { land, water } = look
  const rng = pieceRng(seed)
  const length = Math.min(place.room * 0.9, 4) * piece.scale + 1
  const angle = rng() * Math.PI
  const hull = hullOf(place.x, place.y, length, angle)
  haze(pen, hull, { colour: look.light.shade, blur: 0.5 })
  pen.fillStyle = shade(water.deep, -0.25)
  pen.globalAlpha = 0.7
  trace(pen, hull)
  pen.fill()
  pen.globalAlpha = 1
  // Only the bow half breaks the surface
  const bow = hull.slice(2, 5)
  const lifted = shift([[place.x, place.y], ...bow], liftOf(board, place.x, place.y, 0.3))
  haze(pen, lifted, { colour: water.foam, blur: 0.35 })
  pen.fillStyle = land.rust
  trace(pen, lifted)
  pen.fill()
  pen.strokeStyle = shade(land.rust, -0.35)
  pen.lineWidth = 0.06
  pen.stroke()
  const [mx, my] = liftOf(board, place.x, place.y, 1.4)
  pen.strokeStyle = land.steel
  pen.lineWidth = 0.09
  pen.beginPath()
  pen.moveTo(place.x + Math.cos(angle) * length * 0.18, place.y + Math.sin(angle) * length * 0.18)
  pen.lineTo(
    place.x + Math.cos(angle) * length * 0.18 + mx,
    place.y + Math.sin(angle) * length * 0.18 + my
  )
  pen.stroke()
  const x = place.x - Math.cos(angle) * length * 0.42
  const y = place.y - Math.sin(angle) * length * 0.42
  paintStone(scene, { outline: stoneOutline(x, y, 0.22, rng), x, y, height: 0.2 })
}
