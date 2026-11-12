import { paintPalm } from '@/composites/play/naval/world/decor/palm'
import { paintFoam, paintStone, stoneOutline } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { blob, extrude, grow, haze, shift, sunlit, trace } from '@/composites/play/naval/world/pen'
import type { Outline } from '@/composites/play/naval/world/pen'

/**
 * Canopy clumps, round crowns shaded by the sun
 * @param {DecorScene} scene - Scene
 * @param {Outline} green - Vegetation footprint, already lifted
 * @param {Object} box - Centre and radii
 * @return {void}
 */

export const paintCanopy = (
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
