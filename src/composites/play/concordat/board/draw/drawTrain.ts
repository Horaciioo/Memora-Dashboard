import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'

const { rails, train } = CONCORDAT_ART

/**
 * Flat train in the colour of its nation: a few plain cars sized on the rail, never grown by the zoom
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {number} x - Centre in pixels
 * @param {number} y - Centre in pixels
 * @param {number} scale - Screen pixels of a map tile
 * @param {number} angle - Heading in radians, zero looks right
 * @param {readonly number[]} color - Nation colour
 * @return {void}
 */

export const drawTrain = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  angle: number,
  color: readonly number[]
): void => {
  const rail = Math.min(rails.max, Math.max(rails.min, scale * rails.base))
  const width = Math.min(train.max, rail * train.width)
  const length = width * train.length
  const gap = width * train.gap
  const total = train.cars * length + (train.cars - 1) * gap
  // Rails run along an axis, so the heading snaps to one
  const heading = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2)

  context.save()
  context.translate(x, y)
  context.rotate(heading)
  context.lineWidth = 1.5
  context.strokeStyle = rgbText(color.map((value) => Math.round(value * rails.shade)))
  for (let index = 0; index < train.cars; index++) {
    const at = -total / 2 + index * (length + gap)
    // The engine leads, the cars behind are paler
    context.fillStyle = rgbText(
      index === train.cars - 1
        ? color
        : color.map((value) => Math.round(value + (255 - value) * rails.tint * 0.5))
    )
    context.beginPath()
    context.roundRect(at, -width / 2, length, width, width * 0.3)
    context.fill()
    context.stroke()
  }
  context.restore()
}
