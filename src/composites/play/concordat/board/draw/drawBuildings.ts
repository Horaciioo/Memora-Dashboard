import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_GLYPHS } from '@/declarations/play/concordat/glyphs'

const { detail, frame, token } = CONCORDAT_ART

// Glyph paths are parsed once
const PATHS = new Map<string, Path2D>()
const pathOf = (d: string): Path2D => {
  const known = PATHS.get(d)
  if (known) return known
  const path = new Path2D(d)
  PATHS.set(d, path)

  return path
}

/**
 * Buildings as round tokens in the nation colour with a pictogram and level pips
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
    const glyph = CONCORDAT_GLYPHS[building.kind]
    const color = colors[building.owner] ?? frame.shadow

    context.save()
    context.translate(x, y)
    context.globalAlpha = isBuilding ? 0.7 : 1

    // Shadow, body and pale ring
    context.fillStyle = rgbText(frame.shadow, 0.35)
    context.beginPath()
    context.ellipse(radius * 0.18, radius * 0.7, radius, radius * 0.45, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = rgbText(color)
    context.strokeStyle = rgbText(frame.rgb)
    context.lineWidth = token.ring * (building.owner === client.me ? 1.5 : 1)
    context.beginPath()
    context.arc(0, 0, radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()

    // Pictogram, cream on the colour
    const unit = (size * token.glyph) / 24
    context.save()
    context.scale(unit, unit)
    context.translate(-12, -12)
    context.fillStyle = rgbText(frame.rgb)
    context.strokeStyle = rgbText(frame.rgb)
    if (glyph.isStroke) {
      context.lineWidth = 2.1
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.stroke(pathOf(glyph.path))
    } else {
      context.fill(pathOf(glyph.path), 'evenodd')
    }
    context.restore()

    // A turning dashed ring while it rises
    if (isBuilding) {
      context.setLineDash([4, 4])
      context.lineDashOffset = -now * 0.01
      context.strokeStyle = rgbText(frame.rgb, 0.95)
      context.lineWidth = 1.6
      context.beginPath()
      context.arc(0, 0, radius + 3, 0, Math.PI * 2)
      context.stroke()
      context.setLineDash([])
    }

    // Level pips under the token
    const pip = Math.max(1.8, size * token.pip)
    for (let level = 0; level < building.level; level++) {
      context.fillStyle = rgbText(frame.rgb)
      context.strokeStyle = rgbText(frame.shadow, 0.8)
      context.lineWidth = 1
      context.beginPath()
      context.arc(
        (level - (building.level - 1) / 2) * pip * 2.6,
        radius + pip * 2.2,
        pip,
        0,
        Math.PI * 2
      )
      context.fill()
      context.stroke()
    }

    // Stack count, top right
    if (count > 1) {
      const badge = Math.max(5, size * token.badge)
      const bx = radius * 0.78
      const by = -radius * 0.78
      context.fillStyle = rgbText(frame.rgb)
      context.strokeStyle = rgbText(color)
      context.lineWidth = Math.max(1.4, token.ring * 0.8)
      context.beginPath()
      context.arc(bx, by, badge, 0, Math.PI * 2)
      context.fill()
      context.stroke()
      context.fillStyle = rgbText(color)
      context.font = `700 ${Math.round(badge * 1.35)}px ${font}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(String(count), bx, by + badge * 0.06)
    }
    context.restore()
  }
}
