import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Color } from 'three'

/**
 * Soft round puff, white fading out
 * @param {number} size - Canvas pixels
 * @return {CanvasTexture} - Texture
 */

export const mistTexture = (size: number): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    const glow = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    glow.addColorStop(0, 'white')
    glow.addColorStop(1, 'transparent')
    context.fillStyle = glow
    context.fillRect(0, 0, size, size)
  }

  return new CanvasTexture(canvas)
}

/**
 * Name written over a ball
 * @param {string} name - Player name
 * @param {Color} color - Text colour
 * @param {Color} shade - Shadow colour
 * @param {Object} size - Canvas pixels and font
 * @param {number} size.width - Canvas width
 * @param {number} size.height - Canvas height
 * @param {number} size.font - Font pixels
 * @param {number} size.shadow - Shadow blur
 * @return {CanvasTexture} - Texture
 */

export const labelTexture = (
  name: string,
  color: Color,
  shade: Color,
  { width, height, font, shadow }: { width: number; height: number; font: number; shadow: number }
): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context) {
    context.font = `800 ${font}px ${getComputedStyle(document.body).fontFamily}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.shadowColor = `#${shade.getHexString()}`
    context.shadowBlur = shadow
    context.fillStyle = `#${color.getHexString()}`
    context.fillText(name, width / 2, height / 2, width - shadow * 2)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}
