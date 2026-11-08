import { CanvasTexture, RepeatWrapping } from 'three'

import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { canvasTexture } from '@/composites/play/golf/scene/canvasTexture'

const { vortex } = GOLF_SCENE

// Canvas pixels
const SIZE = 256

/**
 * Alpha fading across a band, solid at its line
 * @return {CanvasTexture} - Alpha map
 */

export const bandTexture = (): CanvasTexture =>
  canvasTexture(4, 64, (context) => {
    const fade = context.createLinearGradient(0, 64, 0, 0)
    fade.addColorStop(0, 'white')
    fade.addColorStop(0.35, 'rgb(150 150 150)')
    fade.addColorStop(1, 'black')
    context.fillStyle = fade
    context.fillRect(0, 0, 4, 64)
  })

/**
 * White spiral arms on clear, denser toward the centre
 * @return {CanvasTexture} - Texture
 */

export const spiralTexture = (): CanvasTexture =>
  canvasTexture(SIZE, SIZE, (context) => {
    const middle = SIZE / 2
    context.strokeStyle = 'white'
    context.lineCap = 'round'
    for (let arm = 0; arm < vortex.arms; arm += 1) {
      context.beginPath()
      for (let step = 0; step <= 60; step += 1) {
        // Log spiral, from the rim to the core
        const share = 1 - step / 60
        const radius = middle * (0.12 + 0.86 * share)
        const angle = (arm / vortex.arms) * Math.PI * 2 + Math.log(radius / middle) * vortex.twist
        const x = middle + Math.cos(angle) * radius
        const y = middle + Math.sin(angle) * radius
        if (step === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.lineWidth = SIZE * 0.05
      context.stroke()
    }
    // Faint at the rim, full at the core
    context.globalCompositeOperation = 'destination-in'
    const fade = context.createRadialGradient(middle, middle, 0, middle, middle, middle)
    fade.addColorStop(0, 'rgba(0 0 0 / 1)')
    fade.addColorStop(1, 'rgba(0 0 0 / 0.2)')
    context.fillStyle = fade
    context.fillRect(0, 0, SIZE, SIZE)
  })

/**
 * One chevron pointing up on clear, tiling up the plate
 * @return {CanvasTexture} - White chevron, tinted by the material
 */

export const chevronTileTexture = (): CanvasTexture => {
  const texture = canvasTexture(SIZE, SIZE, (context) => {
    context.strokeStyle = 'white'
    context.lineWidth = SIZE * 0.16
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(SIZE * 0.2, SIZE * 0.68)
    context.lineTo(SIZE * 0.5, SIZE * 0.32)
    context.lineTo(SIZE * 0.8, SIZE * 0.68)
    context.stroke()
  })
  texture.wrapT = RepeatWrapping

  return texture
}
