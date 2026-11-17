import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText, tieOfRows, troopFigure } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { ConcordatPowers } from '@/utils/constants/concordat'

const { label } = CONCORDAT_ART

// Text with a pale outline so it reads on any colour
const outlined = (context: CanvasRenderingContext2D, text: string, x: number, y: number): void => {
  context.lineWidth = label.stroke
  context.strokeStyle = rgbText(label.halo, 0.85)
  context.strokeText(text, x, y)
  context.fillStyle = rgbText(label.ink)
  context.fillText(text, x, y)
}

// Handshake emoji centred over an ally, large like on a desktop map
const drawHandshake = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  font: string
): void => {
  context.font = `${Math.round(size)}px ${font}`
  context.fillText(CONCORDAT_HUD_COPY.allyEmoji, x, y)
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
    const player = client.players[index]
    // Wild tribes stay unnamed grey land
    if (place.tiles < label.minTiles || !player?.alive || player.kind === ConcordatPowers.Tribe)
      return
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
      drawHandshake(context, x, y - size * 1.5, size * 1.9, scene.font)
    }

    // Troops available, under the name
    const troops = Math.round(size * label.troopSize)
    context.font = `700 ${troops}px ${scene.font}`
    outlined(context, troopFigure(client.players[index].troops), x, y + size * label.troopGap)
  })
}
