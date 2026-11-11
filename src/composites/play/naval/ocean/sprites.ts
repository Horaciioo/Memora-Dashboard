import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Sprites kept at once, older sizes are dropped
const MAX_SPRITES = 8
const sprites = new Map<string, HTMLCanvasElement>()

/**
 * Fire glow of a burning square
 * @param {number} cell - Square in CSS pixels
 * @param {number} ratio - Pixel density
 * @return {HTMLCanvasElement} - Sprite, one square across
 */

export const glowSprite = (cell: number, ratio: number): HTMLCanvasElement => {
  const pixels = Math.max(1, Math.round(cell * ratio))
  const key = `glow:${pixels}`
  const cached = sprites.get(key)
  if (cached) return cached
  if (sprites.size >= MAX_SPRITES) sprites.clear()
  const canvas = document.createElement('canvas')
  canvas.width = pixels
  canvas.height = pixels
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const half = pixels / 2
    const glow = ctx.createRadialGradient(half, half, 0, half, half, pixels * 0.45)
    glow.addColorStop(0, NAVAL_WATER.fire)
    glow.addColorStop(0.45, NAVAL_WATER.hit)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, pixels, pixels)
  }
  sprites.set(key, canvas)

  return canvas
}
