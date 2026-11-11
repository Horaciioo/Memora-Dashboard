import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, grow, haze, part, shade, sunlit, trace } from '@/composites/play/naval/world/pen'
import type { Outline, Pen } from '@/composites/play/naval/world/pen'

/**
 * Faceted stone outline, a few sharp corners
 * @param {number} x - Centre column
 * @param {number} y - Centre row
 * @param {number} radius - Squares
 * @param {() => number} rng - Random source
 * @return {Outline} - Points
 */

export const stoneOutline = (x: number, y: number, radius: number, rng: () => number): Outline => {
  const corners = 6 + Math.floor(rng() * 3)
  const turn = rng() * Math.PI

  return Array.from({ length: corners }, (_, index) => {
    const angle = turn + (index / corners) * Math.PI * 2 + (rng() - 0.5) * 0.5
    const reach = radius * (0.7 + rng() * 0.45)

    return [x + Math.cos(angle) * reach, y + Math.sin(angle) * reach * 0.8]
  })
}

/**
 * Foam ring licking a footprint, broken by gaps
 * @param {Pen} pen - Pen
 * @param {Outline} outline - Footprint
 * @param {string} foam - Colour
 * @param {number} width - Squares
 * @return {void}
 */

export const paintFoam = (pen: Pen, outline: Outline, foam: string, width: number): void => {
  haze(pen, grow(outline, 1.18), { colour: foam, blur: width * 3 })
  pen.save()
  pen.strokeStyle = foam
  pen.lineWidth = width
  pen.lineJoin = 'round'
  pen.setLineDash([width * 5, width * 2.2, width * 1.5, width * 2.6])
  pen.globalAlpha = 0.85
  trace(pen, grow(outline, 1.08))
  pen.stroke()
  pen.restore()
}

/**
 * One rock: shallows, cast shadow, foam, faceted solid with a lit ridge
 * @param {DecorScene} scene - Scene
 * @param {Object} stone - Stone
 * @return {void}
 */

export const paintStone = (
  { pen, board, look }: DecorScene,
  { outline, x, y, height }: { outline: Outline; x: number; y: number; height: number }
): void => {
  const { land, water, sun } = look
  const lift = liftOf(board, x, y, height)
  const radius = Math.max(...outline.map(([px, py]) => Math.hypot(px - x, py - y)))
  haze(pen, grow(outline, 1.9), { colour: water.lagoon, blur: radius * 1.2 })
  haze(pen, outline, {
    colour: look.light.shade,
    blur: radius * 0.5,
    dx: -sun[0] * height,
    dy: -sun[1] * height,
  })
  paintFoam(pen, outline, water.foam, Math.max(0.05, radius * 0.07))
  extrude(pen, {
    outline,
    lift,
    side: land.rockDark,
    top: sunlit(pen, { x: x + lift[0], y: y + lift[1], radius, sun, colour: land.rock, strength: 0.3 }),
  })

  // Ridge from the sunny corner to the crown
  const crown = part(lift, 1)
  pen.strokeStyle = shade(land.rockLight, 0.1)
  pen.lineWidth = radius * 0.08
  pen.lineCap = 'round'
  pen.globalAlpha = 0.7
  pen.beginPath()
  pen.moveTo(x + crown[0] + sun[0] * radius * 0.7, y + crown[1] + sun[1] * radius * 0.6)
  pen.lineTo(x + crown[0], y + crown[1])
  pen.stroke()
  pen.globalAlpha = 1
}

/**
 * A cluster of coastal rocks
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintRocks: DecorPainter = (scene) => {
  const { place, piece, seed } = scene
  const rng = pieceRng(seed)
  const reach = Math.min(place.room * 0.45, 2.4) * piece.scale
  const count = 3 + Math.floor(rng() * 3)
  const stones = Array.from({ length: count }, (_, index) => {
    const angle = rng() * Math.PI * 2
    const away = index ? reach * (0.35 + rng() * 0.65) : 0
    const x = place.x + Math.cos(angle) * away
    const y = place.y + Math.sin(angle) * away * 0.7
    const radius = reach * (index ? 0.18 + rng() * 0.16 : 0.4)

    return { x, y, outline: stoneOutline(x, y, radius, rng), height: radius * (0.9 + rng() * 0.7) }
  })
  // Far stones first, the nearest one on top
  for (const stone of stones.toSorted((a, b) => a.y - b.y)) paintStone(scene, stone)
}

/**
 * Black rock islet: a wide low slab, a crest and a few stones
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintIslet: DecorPainter = (scene) => {
  const { place, piece, seed } = scene
  const rng = pieceRng(seed)
  const radius = Math.min(place.room * 0.42, 3) * piece.scale
  const slab = stoneOutline(place.x, place.y, radius, rng)
  paintStone(scene, { outline: slab, x: place.x, y: place.y, height: radius * 0.45 })
  const crest = stoneOutline(place.x - radius * 0.15, place.y - radius * 0.2, radius * 0.45, rng)
  paintStone(scene, { outline: crest, x: place.x, y: place.y, height: radius * 1.1 })
  for (let index = 0; index < 3; index += 1) {
    const angle = rng() * Math.PI * 2
    const x = place.x + Math.cos(angle) * radius * 1.35
    const y = place.y + Math.sin(angle) * radius
    paintStone(scene, { outline: stoneOutline(x, y, radius * 0.16, rng), x, y, height: radius * 0.25 })
  }
}
