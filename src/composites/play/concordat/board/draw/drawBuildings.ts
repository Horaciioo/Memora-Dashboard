import { drawSprite, spriteWidth } from '@/composites/play/concordat/board/draw/pixelSprite'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'

const { detail, frame, token } = CONCORDAT_ART

/**
 * Buildings as pixel houses in the nation colour, level pips under them
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawBuildings = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, colors, font, now } = scene
  if (camera.scale < detail.buildings) return
  const size = Math.min(token.max, Math.max(token.min, camera.scale * token.base))
  const radius = size / 2

  // A stack shows once, its best level and its count
  const stacks = new Map<
    string,
    { building: (typeof client.systems.buildings)[number]; count: number }
  >()
  for (const building of client.systems.buildings) {
    const key = `${building.tile}:${building.kind}`
    const stack = stacks.get(key)
    if (!stack) stacks.set(key, { building, count: 1 })
    else {
      stack.count++
      if (building.level > stack.building.level) stack.building = building
      if (building.readyAt > client.tick)
        stack.building = { ...stack.building, readyAt: building.readyAt }
    }
  }

  for (const { building, count } of stacks.values()) {
    const column = building.tile % client.map.width
    const row = (building.tile - column) / client.map.width
    const x = camera.x + (column + 0.5) * camera.scale
    const y = camera.y + (row + 0.5) * camera.scale
    const isBuilding = building.readyAt > client.tick
    const color = colors[building.owner] ?? frame.shadow

    context.save()
    context.translate(x, y)
    context.globalAlpha = isBuilding ? 0.7 : 1

    // The house, one sprite pixel snapped to whole screen pixels
    const pixel = Math.max(2, Math.round(size / spriteWidth(building.kind)))
    if (building.owner === client.me) {
      context.fillStyle = rgbText(frame.rgb, 0.9)
      const pad = pixel * 5.2
      context.fillRect(-pad, -pad, pad * 2, pad * 2)
    }
    drawSprite(context, building.kind, color, 0, 0, pixel, 0)

    // A turning dashed square while it rises
    if (isBuilding) {
      context.setLineDash([4, 4])
      context.lineDashOffset = -now * 0.01
      context.strokeStyle = rgbText(frame.rgb, 0.95)
      context.lineWidth = 1.6
      context.strokeRect(-radius - 3, -radius - 3, size + 6, size + 6)
      context.setLineDash([])
    }

    // Level pips under the house, square pixels
    const pip = Math.max(2, Math.round(size * token.pip))
    for (let level = 0; level < building.level; level++) {
      const px = Math.round((level - (building.level - 1) / 2) * pip * 2.4 - pip / 2)
      const py = Math.round(radius + pip)
      context.fillStyle = rgbText(frame.shadow)
      context.fillRect(px - 1, py - 1, pip + 2, pip + 2)
      context.fillStyle = rgbText(frame.rgb)
      context.fillRect(px, py, pip, pip)
    }

    // Stack count, top right
    if (count > 1) {
      const badge = Math.max(5, size * token.badge)
      const bx = radius * 0.78
      const by = -radius * 0.78
      context.fillStyle = rgbText(frame.rgb)
      context.strokeStyle = rgbText(color)
      context.lineWidth = Math.max(1.4, token.ring * 0.8)
      context.fillRect(bx - badge, by - badge, badge * 2, badge * 2)
      context.strokeRect(bx - badge, by - badge, badge * 2, badge * 2)
      context.fillStyle = rgbText(color)
      context.font = `700 ${Math.round(badge * 1.35)}px ${font}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(String(count), bx, by + badge * 0.06)
    }
    context.restore()
  }
}
