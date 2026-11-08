import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Color } from 'three'

// Gradient and shade pixels
const ORB_PIXELS = 64

/**
 * Canvas texture from a drawing
 * @param {number} width - Pixels across
 * @param {number} height - Pixels down
 * @param {(context: CanvasRenderingContext2D) => void} paint - Drawing
 * @return {CanvasTexture} - Texture
 */

const canvasTexture = (
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void
): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context) paint(context)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

/**
 * Orb glass, light on top and deeper below
 * @param {Color} top - Upper tint
 * @param {Color} bottom - Lower tint
 * @return {CanvasTexture} - Texture wrapped on a sphere
 */

export const orbGlassTexture = (top: Color, bottom: Color): CanvasTexture =>
  canvasTexture(2, ORB_PIXELS, (context) => {
    const gradient = context.createLinearGradient(0, 0, 0, ORB_PIXELS)
    gradient.addColorStop(0, `#${top.clone().lerp(bottom, 0.1).getHexString()}`)
    gradient.addColorStop(0.55, `#${top.clone().lerp(bottom, 0.55).getHexString()}`)
    gradient.addColorStop(1, `#${bottom.getHexString()}`)
    context.fillStyle = gradient
    context.fillRect(0, 0, 2, ORB_PIXELS)
  })

/**
 * Soft dark disc fading at the rim, a contact shade
 * @param {Color} ink - Shade colour
 * @return {CanvasTexture} - Texture
 */

export const softShadeTexture = (ink: Color): CanvasTexture =>
  canvasTexture(ORB_PIXELS, ORB_PIXELS, (context) => {
    const half = ORB_PIXELS / 2
    const gradient = context.createRadialGradient(half, half, 0, half, half, half)
    const hex = `#${ink.getHexString()}`
    gradient.addColorStop(0, `${hex}ff`)
    gradient.addColorStop(0.5, `${hex}99`)
    gradient.addColorStop(1, `${hex}00`)
    context.fillStyle = gradient
    context.fillRect(0, 0, ORB_PIXELS, ORB_PIXELS)
  })
