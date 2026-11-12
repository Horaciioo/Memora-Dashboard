import { circle, paintLamp } from '@/composites/play/naval/world/decor/blocks'
import { paintStone, stoneOutline } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, haze, part, shade, trace } from '@/composites/play/naval/world/pen'
import type { Outline } from '@/composites/play/naval/world/pen'

// Squares across the breakwater walk
const WALK = 0.8
// Stone courses of the tower
const COURSES = 11

/**
 * Breakwater from the shore to the tower: blocks on both flanks, a paved walk, a parapet
 * @param {DecorScene} scene - Scene
 * @param {Object} mole - Tip and source
 * @return {void}
 */

const paintMole = (
  scene: DecorScene,
  { x, tip, root, rng }: { x: number; tip: number; root: number; rng: () => number }
): void => {
  const { pen, board, look } = scene
  const { land, water } = look
  const walk: Outline = [
    [x - WALK / 2, tip],
    [x + WALK / 2, tip],
    [x + WALK / 2, root],
    [x - WALK / 2, root],
  ]
  haze(pen, walk, { colour: water.lagoon, blur: 1.2 })
  for (let y = tip; y < root; y += 0.32) {
    for (const side of [-1, 1]) {
      const bx = x + side * (WALK / 2 + 0.12 + rng() * 0.1)
      paintStone(scene, {
        outline: stoneOutline(bx, y, 0.2 + rng() * 0.08, rng),
        x: bx,
        y,
        height: 0.3,
      })
    }
  }
  const lift = liftOf(board, x, (tip + root) / 2, 0.45)
  extrude(pen, { outline: walk, lift, side: land.stoneDark, top: land.paving })
  pen.strokeStyle = shade(land.stoneDark, -0.1)
  pen.globalAlpha = 0.4
  pen.lineWidth = 0.02
  pen.beginPath()
  for (let y = tip; y < root; y += 0.4) {
    pen.moveTo(x - WALK / 2 + lift[0], y + lift[1])
    pen.lineTo(x + WALK / 2 + lift[0], y + lift[1])
  }
  pen.stroke()
  pen.globalAlpha = 1
  const parapet: Outline = [
    [x - WALK / 2 + lift[0], tip + lift[1]],
    [x - WALK / 2 + 0.12 + lift[0], tip + lift[1]],
    [x - WALK / 2 + 0.12 + lift[0], root + lift[1]],
    [x - WALK / 2 + lift[0], root + lift[1]],
  ]
  extrude(pen, {
    outline: parapet,
    lift: part(lift, 0.5),
    side: land.stoneDark,
    top: land.stoneLight,
  })
}

/**
 * Old stone tower: courses of warm blocks, a gallery, an amber lantern under a green dome
 * @param {DecorScene} scene - Scene
 * @param {Object} tower - Foot and height
 * @return {void}
 */

const paintTower = (
  scene: DecorScene,
  { x, y, height }: { x: number; y: number; height: number }
): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  const tower = liftOf(board, x, y, height)
  pen.fillStyle = look.light.shade
  pen.beginPath()
  pen.ellipse(
    x - sun[0] * 1.4,
    y - sun[1] * 1.4,
    0.42,
    0.3,
    Math.atan2(-sun[1], -sun[0]),
    0,
    Math.PI * 2
  )
  pen.fill()
  const steps = Math.max(COURSES * 2, Math.ceil(Math.hypot(...tower) * pen.getTransform().a))
  for (let step = 0; step <= steps; step += 1) {
    const share = step / steps
    const course = Math.floor(share * COURSES)
    const tone = course % 2 ? land.stone : land.stoneLight
    pen.fillStyle = shade(tone, -0.18 + share * 0.18 + (course % 3) * 0.02)
    trace(pen, circle(x, y, 0.42 - share * 0.1), ...part(tower, share))
    pen.fill()
  }
  const top = { x: x + tower[0], y: y + tower[1] }
  pen.fillStyle = land.stoneDark
  trace(pen, circle(top.x, top.y, 0.44))
  pen.fill()
  pen.strokeStyle = land.iron
  pen.lineWidth = 0.03
  trace(pen, circle(top.x, top.y, 0.4))
  pen.stroke()
  const lantern = pen.createRadialGradient(top.x, top.y, 0.02, top.x, top.y, 0.24)
  lantern.addColorStop(0, land.lamp)
  lantern.addColorStop(1, shade(land.lamp, -0.35))
  pen.fillStyle = lantern
  trace(pen, circle(top.x, top.y, 0.24))
  pen.fill()
  pen.fillStyle = land.dome
  trace(pen, circle(top.x + tower[0] * 0.04, top.y + tower[1] * 0.04, 0.15))
  pen.fill()
  paintLamp(pen, { x: top.x, y: top.y, radius: 0.7, colour: land.lamp })
  scene.light?.({ x: top.x, y: top.y, radius: 1.2, colour: land.lamp, beat: 'blink' })
}

/**
 * Old harbour light: a stone breakwater from the quay, a round platform, the stone tower
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintBeacon: DecorPainter = (scene) => {
  const { pen, board, look, place, piece, seed } = scene
  const { land, water } = look
  const rng = pieceRng(seed)
  const root = board.top + board.size + place.room
  paintMole(scene, { x: place.x, tip: place.y, root, rng })
  const platform = circle(place.x, place.y, 0.95 * piece.scale)
  haze(pen, platform, { colour: water.foam, blur: 0.4 })
  for (let block = 0; block < 12; block += 1) {
    const angle = (block / 12) * Math.PI * 2
    const bx = place.x + Math.cos(angle) * 1.05 * piece.scale
    const by = place.y + Math.sin(angle) * 0.95 * piece.scale
    paintStone(scene, { outline: stoneOutline(bx, by, 0.26, rng), x: bx, y: by, height: 0.35 })
  }
  const base = liftOf(board, place.x, place.y, 0.55)
  extrude(pen, { outline: platform, lift: base, side: land.stoneDark, top: land.paving })
  paintTower(scene, { x: place.x + base[0], y: place.y + base[1], height: 2.4 * piece.scale })
}
