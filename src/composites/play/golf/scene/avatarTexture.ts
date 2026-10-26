import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Color } from 'three'

/**
 * Round avatar with a seat ring
 * @param {Object} input - Player and look
 * @param {string} input.name - Player name
 * @param {string | null} input.url - Avatar picture
 * @param {Color} input.color - Seat colour
 * @param {Color} input.shade - Letter colour
 * @param {number} input.pixels - Canvas edge
 * @param {number} input.ring - Ring width
 * @return {CanvasTexture} - Texture, picture once loaded
 */

export const avatarTexture = ({
  name,
  url,
  color,
  shade,
  pixels,
  ring,
}: {
  name: string
  url: string | null
  color: Color
  shade: Color
  pixels: number
  ring: number
}): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = pixels
  canvas.height = pixels
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  const centre = pixels / 2
  const inner = centre - ring

  // Disc then ring
  const draw = (picture: HTMLImageElement | null): void => {
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, pixels, pixels)
    context.fillStyle = `#${color.getHexString()}`
    context.beginPath()
    context.arc(centre, centre, centre, 0, Math.PI * 2)
    context.fill()
    context.save()
    context.beginPath()
    context.arc(centre, centre, inner, 0, Math.PI * 2)
    context.clip()
    if (picture) context.drawImage(picture, ring, ring, inner * 2, inner * 2)
    else {
      context.fillStyle = `#${shade.getHexString()}`
      context.fillRect(0, 0, pixels, pixels)
      context.fillStyle = `#${color.getHexString()}`
      context.font = `800 ${inner}px ${getComputedStyle(document.body).fontFamily}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(name.trim().charAt(0).toUpperCase(), centre, centre * 1.06)
    }
    context.restore()
    texture.needsUpdate = true
  }
  draw(null)

  // Picture swaps in
  if (url) {
    const picture = new Image()
    picture.crossOrigin = 'anonymous'
    picture.onload = () => draw(picture)
    picture.src = url
  }

  return texture
}
