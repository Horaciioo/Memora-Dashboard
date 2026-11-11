import type { WorldBoard } from '@/composites/play/naval/world/geometry'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { extrude, shade, trace } from '@/composites/play/naval/world/pen'
import type { Lift, Outline, Pen } from '@/composites/play/naval/world/pen'

/**
 * Rectangle footprint
 * @param {number} x - Left
 * @param {number} y - Top
 * @param {number} width - Squares across
 * @param {number} height - Squares down
 * @return {Outline} - Corners
 */

export const rect = (x: number, y: number, width: number, height: number): Outline => [
  [x, y],
  [x + width, y],
  [x + width, y + height],
  [x, y + height],
]

/**
 * Circle footprint
 * @param {number} x - Centre column
 * @param {number} y - Centre row
 * @param {number} radius - Squares
 * @return {Outline} - Points
 */

export const circle = (x: number, y: number, radius: number): Outline =>
  Array.from({ length: 28 }, (_, index) => {
    const angle = (index / 28) * Math.PI * 2

    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]
  })

/**
 * Box standing on a base, its shadow first
 * @param {Pen} pen - Pen
 * @param {Object} box - Box
 * @return {Lift} - Shift of its roof
 */

export const paintBox = (
  pen: Pen,
  {
    board,
    outline,
    base = [0, 0],
    height,
    side,
    top,
    shadow,
    sun,
  }: {
    board: WorldBoard
    outline: Outline
    base?: Lift
    height: number
    side: string
    top: string | CanvasGradient
    shadow: string
    sun: [number, number]
  }
): Lift => {
  const [x, y] = outline[0]
  const lift = liftOf(board, x, y, height)
  const ground = outline.map(([px, py]): [number, number] => [px + base[0], py + base[1]])
  pen.fillStyle = shadow
  trace(pen, ground, -sun[0] * height * 0.8, -sun[1] * height * 0.8)
  pen.fill()
  extrude(pen, { outline: ground, lift, side, top })

  return [base[0] + lift[0], base[1] + lift[1]]
}

/**
 * Gabled roof over a box: two slopes, the sunny one lighter
 * @param {Pen} pen - Pen
 * @param {Object} roof - Roof
 * @return {void}
 */

export const paintRoof = (
  pen: Pen,
  { x, y, width, height, lift, colour }: { x: number; y: number; width: number; height: number; lift: Lift; colour: string }
): void => {
  const [dx, dy] = lift
  pen.fillStyle = shade(colour, 0.18)
  trace(pen, rect(x, y, width, height / 2), dx, dy)
  pen.fill()
  pen.fillStyle = shade(colour, -0.12)
  trace(pen, rect(x, y + height / 2, width, height / 2), dx, dy)
  pen.fill()
  pen.strokeStyle = shade(colour, 0.35)
  pen.lineWidth = Math.min(width, height) * 0.06
  pen.beginPath()
  pen.moveTo(x + dx, y + height / 2 + dy)
  pen.lineTo(x + width + dx, y + height / 2 + dy)
  pen.stroke()
}

/**
 * Small warm light with its halo
 * @param {Pen} pen - Pen
 * @param {Object} lamp - Lamp
 * @return {void}
 */

export const paintLamp = (
  pen: Pen,
  { x, y, radius, colour }: { x: number; y: number; radius: number; colour: string }
): void => {
  const halo = pen.createRadialGradient(x, y, 0, x, y, radius)
  halo.addColorStop(0, colour)
  halo.addColorStop(0.25, colour)
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  pen.save()
  pen.globalCompositeOperation = 'lighter'
  pen.globalAlpha = 0.7
  pen.fillStyle = halo
  pen.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  pen.restore()
}
