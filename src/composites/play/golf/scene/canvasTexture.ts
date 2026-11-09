import { CanvasTexture, SRGBColorSpace } from 'three'

/**
 * Texture painted on a canvas
 * @param {number} width - Pixels across
 * @param {number} height - Pixels down
 * @param {(context: CanvasRenderingContext2D) => void} paint - Drawing
 * @return {CanvasTexture} - Texture
 */

export const canvasTexture = (
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
