import { CanvasTexture } from 'three'
import type { Color } from 'three'
import { canvasTexture } from '@/composites/play/golf/scene/canvasTexture'

// Gradient and shade pixels
const ORB_PIXELS = 64

// Power card pixels across and down
const CARD_WIDTH = 96
const CARD_HEIGHT = 128
// Rounded corner, white frame and sheen band
const CARD_CORNER = 14
const CARD_FRAME = 5
const CARD_HUES = [0, 40, 70, 140, 200, 260, 310]

/**
 * Rainbow power card: holographic gradient, white frame, a sheen band and a question mark
 * @param {string} font - Font family of the mark
 * @return {CanvasTexture} - Texture
 */

export const orbCardTexture = (font: string): CanvasTexture =>
  canvasTexture(CARD_WIDTH, CARD_HEIGHT, (context) => {
    // Frame, then the rainbow inside it
    context.fillStyle = 'white'
    context.beginPath()
    context.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_CORNER)
    context.fill()
    const rainbow = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
    CARD_HUES.forEach((hue, index) =>
      rainbow.addColorStop(index / (CARD_HUES.length - 1), `hsl(${hue} 95% 62%)`)
    )
    context.fillStyle = rainbow
    context.beginPath()
    context.roundRect(
      CARD_FRAME,
      CARD_FRAME,
      CARD_WIDTH - CARD_FRAME * 2,
      CARD_HEIGHT - CARD_FRAME * 2,
      CARD_CORNER - 4
    )
    context.fill()
    // Sheen band
    const sheen = context.createLinearGradient(0, CARD_HEIGHT * 0.2, CARD_WIDTH, CARD_HEIGHT * 0.6)
    sheen.addColorStop(0, 'rgba(255,255,255,0)')
    sheen.addColorStop(0.5, 'rgba(255,255,255,0.45)')
    sheen.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = sheen
    context.fillRect(CARD_FRAME, CARD_FRAME, CARD_WIDTH - CARD_FRAME * 2, CARD_HEIGHT)
    // Mark
    context.font = `900 ${CARD_WIDTH * 0.7}px ${font}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineWidth = CARD_WIDTH * 0.07
    context.strokeStyle = 'rgba(40,20,80,0.55)'
    context.fillStyle = 'white'
    context.strokeText('?', CARD_WIDTH / 2, CARD_HEIGHT * 0.54)
    context.fillText('?', CARD_WIDTH / 2, CARD_HEIGHT * 0.54)
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
