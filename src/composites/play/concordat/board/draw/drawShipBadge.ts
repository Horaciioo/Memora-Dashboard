import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { ConcordatShipKinds } from '@/utils/constants/concordat'
import type { ConcordatShipKind } from '@/utils/constants/concordat'

const { frame, ship } = CONCORDAT_ART
const { badge } = ship

/**
 * Round tag over a ship, crossed guns for war, a coin for trade
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {number} x - Ship centre in pixels
 * @param {number} y - Ship centre in pixels
 * @param {number} size - Hull length in pixels
 * @param {readonly number[]} color - Owner colour
 * @param {ConcordatShipKind} kind - Ship kind
 * @param {number} [hp] - Health in percent, a bar shows once hurt
 * @param {number} [vet] - Veteran rank, one pip each
 * @return {void}
 */

export const drawShipBadge = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: readonly number[],
  kind: ConcordatShipKind,
  hp = 100,
  vet = 0
): void => {
  const radius = size * badge.radius
  const top = y - size * badge.lift

  context.save()
  context.translate(x, top)
  context.fillStyle = rgbText(frame.rgb, 0.95)
  context.beginPath()
  context.arc(0, 0, radius + badge.rim, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = rgbText(color)
  context.beginPath()
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = rgbText(frame.rgb)
  context.fillStyle = rgbText(frame.rgb)
  context.lineWidth = Math.max(1.5, radius * 0.22)
  context.lineCap = 'round'
  const reach = radius * 0.5
  if (kind === ConcordatShipKinds.War) {
    context.beginPath()
    context.moveTo(-reach, -reach)
    context.lineTo(reach, reach)
    context.moveTo(reach, -reach)
    context.lineTo(-reach, reach)
    context.stroke()
  } else if (kind === ConcordatShipKinds.Trade) {
    context.beginPath()
    context.arc(0, 0, reach, 0, Math.PI * 2)
    context.stroke()
  } else {
    context.beginPath()
    context.moveTo(-reach, reach * 0.6)
    context.lineTo(0, -reach)
    context.lineTo(reach, reach * 0.6)
    context.stroke()
  }
  context.restore()

  // Health bar under a hurt warship, rank pips over it
  if (kind !== ConcordatShipKinds.War) return
  const barWidth = size * 0.9
  const barY = y + size * 0.55
  if (hp < 100) {
    context.fillStyle = rgbText(frame.rgb, 0.85)
    context.fillRect(x - barWidth / 2 - 1, barY - 1, barWidth + 2, size * 0.14 + 2)
    context.fillStyle = hp > 50 ? 'rgb(92 184 92)' : hp > 25 ? 'rgb(232 178 48)' : 'rgb(214 76 64)'
    context.fillRect(x - barWidth / 2, barY, (barWidth * hp) / 100, size * 0.14)
  }
  context.fillStyle = 'rgb(255 214 90)'
  for (let pip = 0; pip < vet; pip++) {
    context.beginPath()
    context.arc(
      x + (pip - (vet - 1) / 2) * size * 0.22,
      top - radius - size * 0.12,
      size * 0.07,
      0,
      Math.PI * 2
    )
    context.fill()
  }
}
