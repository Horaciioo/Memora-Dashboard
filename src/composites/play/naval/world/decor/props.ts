import { rect } from '@/composites/play/naval/world/decor/blocks'
import type { DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { extrude, shade, trace } from '@/composites/play/naval/world/pen'
import type { Lift, Outline } from '@/composites/play/naval/world/pen'

// Where a prop stands, its ground already lifted
export interface PropSpot {
  x: number
  y: number
  base?: Lift
}

/**
 * Soft shadow of a round thing on the ground
 * @param {DecorScene} scene - Scene
 * @param {Object} spot - Centre and size
 * @return {void}
 */

const paintRoundShadow = (
  { pen, look }: DecorScene,
  { x, y, radius, height }: { x: number; y: number; radius: number; height: number }
): void => {
  const [sx, sy] = look.sun
  pen.fillStyle = look.light.shade
  pen.beginPath()
  pen.ellipse(x - sx * height, y - sy * height, radius, radius * 0.8, 0, 0, Math.PI * 2)
  pen.fill()
}

/**
 * Amphora seen from above: round belly, dark open mouth, a glint on the sun side
 * @param {DecorScene} scene - Scene
 * @param {PropSpot & { size: number; isLying?: boolean }} amphora - Spot and size
 * @return {void}
 */

export const paintAmphora = (
  scene: DecorScene,
  { x, y, base = [0, 0], size, isLying = false }: PropSpot & { size: number; isLying?: boolean }
): void => {
  const { pen, look } = scene
  const { land, sun } = look
  const cx = x + base[0]
  const cy = y + base[1]
  paintRoundShadow(scene, { x: cx, y: cy, radius: size, height: size * 1.4 })
  const belly = pen.createRadialGradient(
    cx + sun[0] * size * 0.4,
    cy + sun[1] * size * 0.4,
    size * 0.1,
    cx,
    cy,
    size
  )
  belly.addColorStop(0, shade(land.amphora, 0.25))
  belly.addColorStop(1, shade(land.amphora, -0.3))
  pen.fillStyle = belly
  pen.beginPath()
  if (isLying) pen.ellipse(cx, cy, size * 1.5, size * 0.75, 0.4, 0, Math.PI * 2)
  else pen.arc(cx, cy, size, 0, Math.PI * 2)
  pen.fill()
  const mouth = isLying ? { x: cx + size * 1.3, y: cy + size * 0.55 } : { x: cx, y: cy }
  pen.fillStyle = land.amphoraDark
  pen.beginPath()
  pen.arc(mouth.x, mouth.y, size * 0.32, 0, Math.PI * 2)
  pen.fill()
  pen.strokeStyle = shade(land.amphora, 0.15)
  pen.lineWidth = size * 0.12
  pen.stroke()
}

/**
 * Wooden barrel: staves, two iron hoops, upright or lying
 * @param {DecorScene} scene - Scene
 * @param {PropSpot & { size: number; isLying?: boolean }} barrel - Spot and size
 * @return {void}
 */

export const paintBarrel = (
  scene: DecorScene,
  { x, y, base = [0, 0], size, isLying = false }: PropSpot & { size: number; isLying?: boolean }
): void => {
  const { pen, look } = scene
  const { land } = look
  const cx = x + base[0]
  const cy = y + base[1]
  paintRoundShadow(scene, { x: cx, y: cy, radius: size, height: size })
  pen.lineWidth = size * 0.14
  pen.strokeStyle = land.iron
  if (isLying) {
    pen.fillStyle = land.wood
    pen.fillRect(cx - size * 1.2, cy - size * 0.75, size * 2.4, size * 1.5)
    for (const at of [-0.7, 0.7]) {
      pen.beginPath()
      pen.moveTo(cx + at * size, cy - size * 0.75)
      pen.lineTo(cx + at * size, cy + size * 0.75)
      pen.stroke()
    }
    return
  }
  pen.fillStyle = land.wood
  pen.beginPath()
  pen.arc(cx, cy, size, 0, Math.PI * 2)
  pen.fill()
  pen.stroke()
  pen.fillStyle = shade(land.wood, 0.18)
  pen.beginPath()
  pen.arc(cx, cy, size * 0.68, 0, Math.PI * 2)
  pen.fill()
  pen.strokeStyle = land.woodDark
  pen.lineWidth = size * 0.05
  for (let stave = -1; stave <= 1; stave += 1) {
    pen.beginPath()
    pen.moveTo(cx + stave * size * 0.3, cy - size * 0.62)
    pen.lineTo(cx + stave * size * 0.3, cy + size * 0.62)
    pen.stroke()
  }
}

/**
 * Wooden crate: a lifted box, planks and a cross brace
 * @param {DecorScene} scene - Scene
 * @param {PropSpot & { size: number; turn?: number }} crate - Spot and size
 * @return {void}
 */

export const paintCrate = (
  scene: DecorScene,
  { x, y, base = [0, 0], size, turn = 0 }: PropSpot & { size: number; turn?: number }
): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)]
  const box: Outline = rect(-size, -size, size * 2, size * 2).map(([px, py]) => [
    x + base[0] + px * cos - py * sin,
    y + base[1] + px * sin + py * cos,
  ])
  const lift = liftOf(board, x, y, size * 1.6)
  pen.fillStyle = look.light.shade
  trace(pen, box, -sun[0] * size * 1.4, -sun[1] * size * 1.4)
  pen.fill()
  extrude(pen, { outline: box, lift, side: land.woodDark, top: land.wood })
  pen.strokeStyle = land.woodDark
  pen.lineWidth = size * 0.12
  trace(pen, box, lift[0], lift[1])
  pen.stroke()
  pen.beginPath()
  pen.moveTo(box[0][0] + lift[0], box[0][1] + lift[1])
  pen.lineTo(box[2][0] + lift[0], box[2][1] + lift[1])
  pen.stroke()
}
