import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Sprites kept at once, older sizes are dropped
const MAX_SPRITES = 16
const sprites = new Map<string, HTMLCanvasElement>()

// Colour stops of each halo
const HALOS = {
  glow: [NAVAL_WATER.fire, NAVAL_WATER.hit],
  flash: [NAVAL_WATER.flash, NAVAL_WATER.fire],
  light: [NAVAL_WATER.flare, NAVAL_WATER.flare],
} as const

export type HaloName = keyof typeof HALOS

/**
 * Prerendered halo, never a gradient per frame
 * @param {HaloName} name - Halo
 * @param {number} cell - Square in CSS pixels
 * @param {number} ratio - Pixel density
 * @return {HTMLCanvasElement} - Sprite, one square across
 */

export const haloSprite = (name: HaloName, cell: number, ratio: number): HTMLCanvasElement => {
  const pixels = Math.max(1, Math.round(cell * ratio))
  const key = `${name}:${pixels}`
  const cached = sprites.get(key)
  if (cached) return cached
  if (sprites.size >= MAX_SPRITES) sprites.clear()
  const canvas = document.createElement('canvas')
  canvas.width = pixels
  canvas.height = pixels
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const half = pixels / 2
    const [core, rim] = HALOS[name]
    const glow = ctx.createRadialGradient(half, half, 0, half, half, pixels * 0.45)
    glow.addColorStop(0, core)
    glow.addColorStop(0.45, rim)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, pixels, pixels)
  }
  sprites.set(key, canvas)

  return canvas
}

/**
 * Halo drawn centred on a point
 * @param {CanvasRenderingContext2D} ctx - Pen
 * @param {HTMLCanvasElement} sprite - Halo
 * @param {{ x: number; y: number }} at - Centre
 * @param {number} across - Width in pixels
 * @return {void}
 */

export const drawHalo = (
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  at: { x: number; y: number },
  across: number
): void => ctx.drawImage(sprite, at.x - across / 2, at.y - across / 2, across, across)
