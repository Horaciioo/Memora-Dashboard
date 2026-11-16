import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { ConcordatPhases } from '@/utils/constants/concordat'

const { arrow, pick } = CONCORDAT_ART

// Arrow with a dash that runs from the sender to the target
export const drawArrow = (
  context: CanvasRenderingContext2D,
  from: [number, number],
  to: [number, number],
  width: number,
  color: readonly number[],
  now: number
): void => {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0])
  const head = width * arrow.head * 2

  context.strokeStyle = rgbText(color, 0.9)
  context.fillStyle = rgbText(color, 0.9)
  context.lineWidth = width
  context.lineCap = 'round'
  context.setLineDash([...arrow.dash])
  context.lineDashOffset = -now * arrow.speed
  context.beginPath()
  context.moveTo(from[0], from[1])
  context.lineTo(to[0] - Math.cos(angle) * head, to[1] - Math.sin(angle) * head)
  context.stroke()
  context.setLineDash([])
  context.beginPath()
  context.moveTo(to[0], to[1])
  context.lineTo(to[0] - Math.cos(angle - 0.45) * head, to[1] - Math.sin(angle - 0.45) * head)
  context.lineTo(to[0] - Math.cos(angle + 0.45) * head, to[1] - Math.sin(angle + 0.45) * head)
  context.closePath()
  context.fill()
}

/**
 * Engagements between two nations, width from the troops sent
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawArrows = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, places, colors, now } = scene

  for (const corps of client.corps) {
    const source = places[corps.owner - 1]
    const target = places[corps.target - 1]
    if (!source?.tiles || !target?.tiles) continue
    const width = Math.min(arrow.max, Math.max(arrow.min, corps.troops * arrow.scale))
    drawArrow(
      context,
      [camera.x + source.x * camera.scale, camera.y + source.y * camera.scale],
      [camera.x + target.x * camera.scale, camera.y + target.y * camera.scale],
      width,
      colors[corps.owner],
      now
    )
  }
}

/**
 * Round of the start area around the pointer while picking
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawPick = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, hoverTile, colors } = scene
  if (client.phase !== ConcordatPhases.Picking || !client.me || hoverTile < 0) return
  const column = (hoverTile % client.map.width) + 0.5
  const row = Math.floor(hoverTile / client.map.width) + 0.5

  context.beginPath()
  context.arc(
    camera.x + column * camera.scale,
    camera.y + row * camera.scale,
    CONCORDAT_ART.startRadius * camera.scale,
    0,
    Math.PI * 2
  )
  context.fillStyle = rgbText(colors[client.me], pick.fill)
  context.fill()
  context.lineWidth = pick.line
  context.strokeStyle = rgbText(pick.rgb)
  context.setLineDash([6, 5])
  context.stroke()
  context.setLineDash([])
}
