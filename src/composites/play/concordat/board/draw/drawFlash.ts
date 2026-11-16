import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { rgbText } from '@/core/lib/play/concordat'
import type { ConcordatWave } from '@/composites/play/concordat/board/draw/types'

const { flash } = CONCORDAT_ART

/**
 * Bright front over freshly taken tiles, fading as it passes
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @param {ConcordatWave[]} waves - Tiles with their start time, pruned in place
 * @return {boolean} - Still moving
 */

export const drawFlash = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene,
  waves: ConcordatWave[]
): boolean => {
  const { camera, client, width, height, colors, now } = scene
  const { scale } = camera
  let kept = 0
  // Lifted colour per nation, worked out once per frame
  const lifted = new Map<number, number[]>()

  for (const wave of waves) {
    const age = now - wave.at
    if (age > flash.ms) continue
    waves[kept++] = wave
    if (age < 0 || scale < flash.minScale) continue
    const x = camera.x + (wave.tile % client.map.width) * scale
    const y = camera.y + Math.floor(wave.tile / client.map.width) * scale
    if (x < -scale || y < -scale || x > width || y > height) continue
    const holder = client.owner[wave.tile]
    let rgb = lifted.get(holder)
    if (!rgb) {
      rgb = (colors[holder] ?? [255, 255, 255]).map((value) => value + (255 - value) * flash.lift)
      lifted.set(holder, rgb)
    }
    context.fillStyle = rgbText(rgb, flash.alpha * (1 - age / flash.ms) ** 2)
    context.fillRect(x, y, scale, scale)
  }
  waves.length = kept

  return kept > 0
}
