import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText, tieOfRows } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_ALLIANCE_GLYPH } from '@/declarations/play/concordat/glyphs'

const { label, paper, detail } = CONCORDAT_ART

// Text with a pale outline so it reads on any colour
const outlined = (context: CanvasRenderingContext2D, text: string, x: number, y: number): void => {
  context.lineWidth = label.stroke
  context.strokeStyle = rgbText(label.halo, 0.85)
  context.strokeText(text, x, y)
  context.fillStyle = rgbText(label.ink)
  context.fillText(text, x, y)
}

// Handshake glyph centred on a point, haloed like the names
const drawHandshake = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void => {
  const path = new Path2D(CONCORDAT_ALLIANCE_GLYPH)
  context.save()
  context.translate(x - size / 2, y - size / 2)
  context.scale(size / 24, size / 24)
  context.lineJoin = 'round'
  context.lineWidth = (label.stroke * 24) / size
  context.strokeStyle = rgbText(label.halo, 0.85)
  context.stroke(path)
  context.fillStyle = rgbText(label.ink)
  context.fill(path)
  context.restore()
}

/**
 * Province names on the paper, close up
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawProvinceNames = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene
): void => {
  const { camera, client, width, height } = scene
  if (camera.scale < detail.provinceNames) return

  context.font = `italic 600 ${Math.round(camera.scale * 0.9)}px ${scene.font}`
  context.fillStyle = rgbText(paper.name, paper.nameAlpha)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  for (const province of client.map.provinces) {
    const x = camera.x + (province.x + 0.5) * camera.scale
    const y = camera.y + (province.y + 0.5) * camera.scale
    if (x < 0 || y < 0 || x > width || y > height) continue
    context.fillText(province.name, x, y)
  }
}

/**
 * Nation names, sized by the span of their territory
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawNationNames = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, places, names, client } = scene

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  places.forEach((place, index) => {
    if (place.tiles < label.minTiles || !client.players[index]?.alive) return
    const size = Math.min(label.max, place.span * camera.scale * label.share)
    if (size < label.min) return
    context.font = `800 ${Math.round(size)}px ${scene.font}`
    const x = camera.x + place.x * camera.scale
    const y = camera.y + place.y * camera.scale
    outlined(context, names[index + 1] ?? '', x, y)

    // Handshake above the name of an ally
    if (
      index + 1 !== client.me &&
      tieOfRows(client.systems.ties, client.me, index + 1) === 'alliance'
    ) {
      drawHandshake(context, x, y - size * 0.95, size * 0.9)
    }

    // Troops available, under the name
    const troops = Math.round(size * label.troopSize)
    context.font = `700 ${troops}px ${scene.font}`
    outlined(context, String(client.players[index].troops), x, y + size * label.troopGap)
  })
}
