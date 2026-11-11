import { paintFoam, paintStone, stoneOutline } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import {
  blob,
  extrude,
  grow,
  haze,
  shade,
  shift,
  sunlit,
  trace,
} from '@/composites/play/naval/world/pen'
import type { Outline, Pen } from '@/composites/play/naval/world/pen'

// Fronds of one palm crown
const FRONDS = 8

/**
 * One frond: a tapered leaf with its midrib, lit on the sun side
 * @param {Pen} pen - Pen
 * @param {Object} frond - Leaf
 * @return {void}
 */

const paintFrond = (
  pen: Pen,
  { length, angle, colour, rib }: { length: number; angle: number; colour: string; rib: string }
): void => {
  pen.save()
  pen.rotate(angle)
  pen.fillStyle = colour
  pen.beginPath()
  pen.moveTo(0, 0)
  pen.quadraticCurveTo(length * 0.5, -length * 0.26, length, length * 0.08)
  pen.quadraticCurveTo(length * 0.5, length * 0.12, 0, 0)
  pen.fill()
  pen.strokeStyle = rib
  pen.lineWidth = length * 0.035
  pen.beginPath()
  pen.moveTo(0, 0)
  pen.quadraticCurveTo(length * 0.5, -length * 0.06, length * 0.96, length * 0.07)
  pen.stroke()
  pen.restore()
}

/**
 * Palm seen from above
 * @param {DecorScene} scene - Scene
 * @param {Object} palm - Foot, size and lean
 * @return {void}
 */

const paintPalm = (
  { pen, board, look }: DecorScene,
  { x, y, size, rng }: { x: number; y: number; size: number; rng: () => number }
): void => {
  const { land, sun } = look
  const [lx, ly] = liftOf(board, x, y, size * 1.6)
  const lean = (rng() - 0.5) * size * 0.6
  const top = { x: x + lx + lean, y: y + ly }

  // Crown shadow cast on the sand
  pen.fillStyle = look.light.shade
  pen.beginPath()
  pen.ellipse(
    x - sun[0] * size * 1.2,
    y - sun[1] * size * 0.9,
    size * 0.85,
    size * 0.5,
    0,
    0,
    Math.PI * 2
  )
  pen.fill()
  pen.strokeStyle = land.trunk
  pen.lineWidth = size * 0.13
  pen.lineCap = 'round'
  pen.beginPath()
  pen.moveTo(x, y)
  pen.quadraticCurveTo(x + lean * 0.2, y + ly * 0.5, top.x, top.y)
  pen.stroke()
  pen.save()
  pen.translate(top.x, top.y)
  const turn = rng() * Math.PI
  for (let index = 0; index < FRONDS; index += 1) {
    const angle = turn + (index / FRONDS) * Math.PI * 2
    // Fronds facing the sun lighter
    const facing = Math.cos(angle) * sun[0] + Math.sin(angle) * sun[1]
    paintFrond(pen, {
      length: size * (0.85 + rng() * 0.3),
      angle,
      colour: shade(index % 2 ? land.leaf : land.leafLight, facing * 0.18 - 0.05),
      rib: shade(land.leafDark, -0.1),
    })
  }
  pen.fillStyle = shade(land.trunk, -0.25)
  pen.beginPath()
  pen.arc(0, 0, size * 0.12, 0, Math.PI * 2)
  pen.fill()
  pen.restore()
}

/**
 * Canopy clumps, round crowns shaded by the sun
 * @param {DecorScene} scene - Scene
 * @param {Outline} green - Vegetation footprint, already lifted
 * @param {Object} box - Centre and radii
 * @return {void}
 */

const paintCanopy = (
  { pen, look, seed }: DecorScene,
  green: Outline,
  { x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }
): void => {
  const { land, sun } = look
  const rng = pieceRng(seed + 9)
  pen.save()
  trace(pen, grow(green, 1.04))
  pen.clip()
  const clumps = Math.round(rx * ry * 9)
  for (let index = 0; index < clumps; index += 1) {
    const angle = rng() * Math.PI * 2
    const reach = Math.sqrt(rng())
    const cx = x + Math.cos(angle) * rx * reach
    const cy = y + Math.sin(angle) * ry * reach
    const radius = Math.min(rx, ry) * (0.2 + rng() * 0.18)
    const crown = pen.createRadialGradient(
      cx + sun[0] * radius * 0.5,
      cy + sun[1] * radius * 0.5,
      radius * 0.1,
      cx,
      cy,
      radius
    )
    crown.addColorStop(0, land.leafLight)
    crown.addColorStop(0.55, land.leaf)
    crown.addColorStop(1, land.leafDark)
    // Shade of the clump on the ones below
    pen.fillStyle = look.light.shade
    pen.beginPath()
    pen.arc(cx - sun[0] * radius * 0.35, cy - sun[1] * radius * 0.35, radius, 0, Math.PI * 2)
    pen.fill()
    pen.fillStyle = crown
    pen.beginPath()
    pen.arc(cx, cy, radius, 0, Math.PI * 2)
    pen.fill()
  }
  pen.restore()
}

/**
 * Tropical island: lagoon glow, wet sand, foam, a low dune, a green heart, palms on the beach
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintIsland: DecorPainter = (scene) => {
  const { pen, board, look, place, piece, seed } = scene
  const { land, water, sun } = look
  const rng = pieceRng(seed)
  const rx = (place.isAcross ? place.room * 0.95 : place.room * 0.45) * piece.scale
  const ry = (place.isAcross ? place.room * 0.42 : place.room * 0.95) * piece.scale
  const shore = blob({ x: place.x, y: place.y, rx, ry, seed })
  haze(pen, grow(shore, 1.9), { colour: water.lagoon, blur: rx * 0.5 })
  haze(pen, grow(shore, 1.25), { colour: water.lagoon, blur: rx * 0.15 })
  paintFoam(pen, shore, water.foam, 0.08)
  pen.fillStyle = land.wet
  trace(pen, grow(shore, 1.04))
  pen.fill()
  const sandLift = liftOf(board, place.x, place.y, 0.25)
  extrude(pen, {
    outline: shore,
    lift: sandLift,
    side: land.sandDark,
    top: sunlit(pen, {
      x: place.x,
      y: place.y,
      radius: rx,
      sun,
      colour: land.sand,
      strength: 0.12,
    }),
  })

  // Green heart, raised over the dune
  const heart = blob({
    x: place.x + rx * 0.08,
    y: place.y - ry * 0.05,
    rx: rx * 0.66,
    ry: ry * 0.6,
    seed: seed + 5,
  })
  const greenLift = liftOf(board, place.x, place.y, 0.9)
  haze(pen, shift(heart, sandLift), {
    colour: look.light.shade,
    blur: 0.5,
    dx: -sun[0] * 0.6,
    dy: -sun[1] * 0.6,
  })
  extrude(pen, {
    outline: shift(heart, sandLift),
    lift: greenLift,
    side: land.leafDark,
    top: land.leaf,
  })
  paintCanopy(scene, shift(heart, [sandLift[0] + greenLift[0], sandLift[1] + greenLift[1]]), {
    x: place.x + rx * 0.08 + sandLift[0] + greenLift[0],
    y: place.y - ry * 0.05 + sandLift[1] + greenLift[1],
    rx: rx * 0.66,
    ry: ry * 0.6,
  })

  // Palms on the beach ring, the nearest last
  const palms = Array.from({ length: 6 }, (_, index) => {
    const angle = (index / 6) * Math.PI * 2 + rng() * 0.6
    return {
      x: place.x + sandLift[0] + Math.cos(angle) * rx * 0.78,
      y: place.y + sandLift[1] + Math.sin(angle) * ry * 0.74,
      size: 0.55 + rng() * 0.25,
      rng,
    }
  })
  for (const palm of palms.toSorted((a, b) => a.y - b.y)) paintPalm(scene, palm)

  // A rock or two on the waterline
  for (let index = 0; index < 2; index += 1) {
    const angle = rng() * Math.PI * 2
    const x = place.x + Math.cos(angle) * rx * 1.08
    const y = place.y + Math.sin(angle) * ry * 1.1
    paintStone(scene, { outline: stoneOutline(x, y, 0.32, rng), x, y, height: 0.35 })
  }
}
