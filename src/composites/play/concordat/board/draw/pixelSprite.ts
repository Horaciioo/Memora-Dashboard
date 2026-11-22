import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_SPRITE_INK, CONCORDAT_SPRITES } from '@/declarations/play/concordat/sprites'
import type { ConcordatSpriteName } from '@/declarations/play/concordat/sprites'

// Sprites are painted once per nation colour
const CACHE = new Map<string, HTMLCanvasElement>()

// Shade of a colour, below zero darker, above lighter
const shadeOf = (color: readonly number[], amount: number): number[] =>
  color.map((value) => Math.max(0, Math.min(255, Math.round(value + amount))))

/**
 * Width of a sprite in its own pixels
 * @param {ConcordatSpriteName} name - Sprite
 * @return {number} - Pixels
 */

export const spriteWidth = (name: ConcordatSpriteName): number =>
  Math.max(...CONCORDAT_SPRITES[name].map((row) => row.length))

// Paint a sprite on a tiny canvas, one canvas pixel per sprite pixel
const paintOf = (name: ConcordatSpriteName, color: readonly number[]): HTMLCanvasElement => {
  const key = `${name}:${color.join(',')}`
  const known = CACHE.get(key)
  if (known) return known

  const rows = CONCORDAT_SPRITES[name]
  const canvas = document.createElement('canvas')
  canvas.width = spriteWidth(name)
  canvas.height = rows.length
  const context = canvas.getContext('2d')
  if (context) {
    const inks: Record<string, readonly number[]> = {
      ...CONCORDAT_SPRITE_INK,
      h: color,
      d: shadeOf(color, -55),
      l: shadeOf(color, 55),
    }
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ink = inks[row[x]]
        if (!ink) continue
        context.fillStyle = rgbText(ink)
        context.fillRect(x, y, 1, 1)
      }
    })
  }
  CACHE.set(key, canvas)

  return canvas
}

/**
 * Draw a pixel sprite centred on a point and turned along its heading, edges kept hard
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatSpriteName} name - Sprite
 * @param {readonly number[]} color - Nation colour
 * @param {number} x - Centre in pixels
 * @param {number} y - Centre in pixels
 * @param {number} pixel - Screen pixels of one sprite pixel
 * @param {number} angle - Heading in radians, zero looks right
 * @return {void}
 */

export const drawSprite = (
  context: CanvasRenderingContext2D,
  name: ConcordatSpriteName,
  color: readonly number[],
  x: number,
  y: number,
  pixel: number,
  angle: number
): void => {
  const canvas = paintOf(name, color)
  const smoothing = context.imageSmoothingEnabled
  context.imageSmoothingEnabled = false
  context.save()
  context.translate(x, y)
  // A ship heading left is mirrored, never upside down
  const isLeft = Math.cos(angle) < 0
  context.rotate(isLeft ? angle - Math.PI : angle)
  if (isLeft) context.scale(-1, 1)
  context.drawImage(
    canvas,
    (-canvas.width * pixel) / 2,
    (-canvas.height * pixel) / 2,
    canvas.width * pixel,
    canvas.height * pixel
  )
  context.restore()
  context.imageSmoothingEnabled = smoothing
}
