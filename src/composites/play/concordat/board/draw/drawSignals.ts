import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { tieOfRows } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_EMOJIS } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { ConcordatTies } from '@/utils/constants/concordat'

const { signal } = CONCORDAT_ART

/**
 * Target rings and emoji bubbles over the nations
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {boolean} - Something still shows
 */

export const drawSignals = (context: CanvasRenderingContext2D, scene: ConcordatScene): boolean => {
  const { camera, client, places, now } = scene
  const { targets, emojis, ties } = client.systems
  let isLive = false

  // A mark shows to the marker and to its allies
  for (const mark of targets) {
    if (mark.until <= client.tick) continue
    const isSeen =
      mark.by === client.me || tieOfRows(ties, client.me, mark.by) === ConcordatTies.Alliance
    const place = places[mark.target - 1]
    if (!isSeen || !place?.tiles) continue

    isLive = true
    const x = camera.x + place.x * camera.scale
    const y = camera.y + place.y * camera.scale
    const pulse = 1 + 0.12 * Math.sin(now * signal.pulse)
    context.strokeStyle = `rgb(${signal.target.join(' ')} / 0.9)`
    context.lineWidth = signal.line
    context.beginPath()
    context.arc(x, y, signal.radius * pulse, 0, Math.PI * 2)
    context.moveTo(x - signal.radius * 1.5, y)
    context.lineTo(x - signal.radius * 0.6, y)
    context.moveTo(x + signal.radius * 0.6, y)
    context.lineTo(x + signal.radius * 1.5, y)
    context.moveTo(x, y - signal.radius * 1.5)
    context.lineTo(x, y - signal.radius * 0.6)
    context.moveTo(x, y + signal.radius * 0.6)
    context.lineTo(x, y + signal.radius * 1.5)
    context.stroke()
  }

  // An emoji floats up over its thrower, only its two nations see a private one
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `${signal.emoji}px ${scene.font}`
  for (const item of emojis) {
    if (item.until <= client.tick) continue
    const isSeen = !item.to || item.to === client.me || item.from === client.me
    const place = places[item.from - 1]
    if (!isSeen || !place?.tiles) continue

    isLive = true
    const left = (item.until - client.tick) / CONCORDAT_TICKS_PER_SECOND
    const rise = (1 - Math.min(1, left / signal.seconds)) * signal.rise
    const x = camera.x + place.x * camera.scale
    const y = camera.y + place.y * camera.scale - signal.lift - rise
    context.globalAlpha = Math.min(1, left)
    context.fillStyle = 'rgb(255 255 255 / 0.92)'
    context.beginPath()
    context.arc(x, y, signal.emoji * 0.85, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#000'
    context.fillText(CONCORDAT_EMOJIS[item.emoji] ?? '', x, y + 1)
    context.globalAlpha = 1
  }

  return isLive
}
