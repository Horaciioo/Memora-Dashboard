import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { rgbText } from '@/core/lib/play/concordat'

const { frame, drop, wash } = CONCORDAT_ART

/**
 * Board frame with its hard drop shadow, then the paper map
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawBoardBase = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, layers } = scene
  const width = client.map.width * camera.scale
  const height = client.map.height * camera.scale
  const edge = Math.min(frame.max, Math.max(frame.min, camera.scale * frame.size))

  context.fillStyle = rgbText(frame.shadow, drop.alpha)
  context.fillRect(
    camera.x - edge + drop.x,
    camera.y - edge + drop.y,
    width + 2 * edge,
    height + 2 * edge
  )
  context.fillStyle = rgbText(frame.rgb)
  context.fillRect(camera.x - edge, camera.y - edge, width + 2 * edge, height + 2 * edge)

  context.imageSmoothingEnabled = camera.scale < 1
  context.drawImage(layers.terrain, camera.x, camera.y, width, height)
  context.drawImage(layers.owner, camera.x, camera.y, width, height)
  if (scene.washed) {
    context.globalAlpha = wash.alpha
    context.drawImage(layers.mask, camera.x, camera.y, width, height)
    context.globalAlpha = 1
  }
}
