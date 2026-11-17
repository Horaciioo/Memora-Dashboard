import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'

const { boat } = CONCORDAT_ART

/**
 * Top-down boat with a wake, bobbing on the water
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {number} x - Centre in pixels
 * @param {number} y - Centre in pixels
 * @param {number} size - Length in pixels
 * @param {number} angle - Heading in radians, zero looks right
 * @param {readonly number[]} hull - Hull colour
 * @param {number} now - Clock in ms
 * @param {number} seed - Offsets the bob of one boat from another
 * @param {boolean} [isMoving] - Draws a wake behind
 * @param {boolean} [isWar] - Sharper bow and a gun
 * @return {void}
 */

export const drawBoat = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number,
  hull: readonly number[],
  now: number,
  seed: number,
  isMoving = false,
  isWar = false
): void => {
  const phase = now / boat.bobMs + seed
  const lift = Math.sin(phase) * size * boat.bob
  const sway = Math.sin(phase * 0.8) * boat.sway

  context.save()
  context.translate(x, y + lift)
  context.rotate(angle + sway)

  // Wake fades behind the stern
  if (isMoving) {
    context.strokeStyle = rgbText(boat.wake, 0.35 + 0.2 * Math.sin(phase * 2))
    context.lineWidth = Math.max(1, size * 0.08)
    for (const side of [-1, 1]) {
      context.beginPath()
      context.moveTo(-size * 0.45, side * size * 0.14)
      context.lineTo(-size * (0.9 + 0.2 * Math.sin(phase)), side * size * 0.3)
      context.stroke()
    }
  }

  // Hull, pointed bow
  context.fillStyle = rgbText(hull)
  context.strokeStyle = rgbText(boat.rim)
  context.lineWidth = Math.max(1, size * 0.07)
  context.beginPath()
  context.moveTo(size * (isWar ? 0.65 : 0.5), 0)
  context.lineTo(size * 0.15, size * 0.24)
  context.lineTo(-size * 0.5, size * 0.2)
  context.lineTo(-size * 0.5, -size * 0.2)
  context.lineTo(size * 0.15, -size * 0.24)
  context.closePath()
  context.fill()
  context.stroke()

  // Deck: a pale cabin, a dark gun on a warship
  context.fillStyle = isWar ? rgbText(boat.gun) : rgbText(boat.rim, 0.9)
  context.fillRect(-size * 0.2, -size * 0.1, size * 0.28, size * 0.2)
  context.restore()
}

/**
 * Small train on its rail: a locomotive and two cars in the colour of its nation
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {number} x - Centre in pixels
 * @param {number} y - Centre in pixels
 * @param {number} size - Length of the locomotive in pixels
 * @param {number} angle - Heading in radians, zero looks right
 * @param {readonly number[]} body - Colour of the cars
 * @return {void}
 */

export const drawTrain = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number,
  body: readonly number[]
): void => {
  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.fillStyle = rgbText(boat.rim)
  context.fillRect(-size * 1.6, -size * 0.09, size * 2.3, size * 0.18)
  context.fillStyle = rgbText(body)
  context.strokeStyle = rgbText(boat.rim)
  context.lineWidth = Math.max(1, size * 0.06)
  for (const offset of [-1.3, -0.65, 0]) {
    context.beginPath()
    context.rect(size * (offset - 0.28), -size * 0.2, size * 0.56, size * 0.4)
    context.fill()
    context.stroke()
  }
  context.fillStyle = rgbText(boat.rim)
  context.fillRect(size * 0.1, -size * 0.12, size * 0.14, size * 0.24)
  context.restore()
}
