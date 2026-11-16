import { drawArrow } from '@/composites/play/concordat/board/draw/drawFront'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'

const { mark, arrow } = CONCORDAT_ART

/**
 * Echo of each click
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawEchoes = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, marks, colors, places, now } = scene
  const mine = colors[client.me] ?? [255, 255, 255]
  const stamp = performance.now()

  for (const item of marks) {
    const age = stamp - item.at
    if (age > mark.ms) continue
    const x = camera.x + ((item.tile % client.map.width) + 0.5) * camera.scale
    const y = camera.y + (Math.floor(item.tile / client.map.width) + 0.5) * camera.scale
    const rgb = item.kind === 'refused' ? mark.red : item.kind === 'build' ? [255, 255, 255] : mine

    // Ripple on the click
    if (age < mark.ripple) {
      const share = age / mark.ripple
      context.strokeStyle = rgbText(rgb, 0.9 * (1 - share))
      context.lineWidth = 3
      context.beginPath()
      context.arc(x, y, 6 + mark.reach * share, 0, Math.PI * 2)
      context.stroke()
    }
    if (item.kind !== 'expand' || client.owner[item.tile] === client.me) continue

    // Goal ring that beats, and the road to it
    const beat = 1 + 0.18 * Math.sin(now / 160)
    context.strokeStyle = rgbText([255, 255, 255], 0.95)
    context.fillStyle = rgbText(mine, 0.55)
    context.lineWidth = 2.5
    context.beginPath()
    context.arc(x, y, mark.goal * beat, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    const place = places[client.me - 1]
    if (!place?.tiles) continue
    drawArrow(
      context,
      [camera.x + place.x * camera.scale, camera.y + place.y * camera.scale],
      [x, y],
      arrow.min + 1,
      mine,
      now
    )
  }
}
