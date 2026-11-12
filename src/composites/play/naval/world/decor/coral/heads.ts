import type { Pen } from '@/composites/play/naval/world/pen'
import { blob, shade, trace } from '@/composites/play/naval/world/pen'

// Shapes a coral head takes
export const CORAL_KINDS = [
  'brain',
  'staghorn',
  'table',
  'fan',
  'tubes',
  'anemone',
  'soft',
] as const

export type CoralKind = (typeof CORAL_KINDS)[number]

/**
 * One coral head on the floor
 * @typedef {Object} CoralHead
 * @property {[number, number]} sun - Light direction
 */

export interface CoralHead {
  x: number
  y: number
  size: number
  colour: string
  kind: CoralKind
  turn: number
  seed: number
  sun: [number, number]
}

/**
 * Round fill lit from the sun side
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @param {number} radius - Squares
 * @return {CanvasGradient} - Fill
 */

const domeOf = (pen: Pen, { x, y, colour, sun }: CoralHead, radius: number): CanvasGradient => {
  const fill = pen.createRadialGradient(
    x + sun[0] * radius * 0.45,
    y + sun[1] * radius * 0.45,
    radius * 0.05,
    x,
    y,
    radius
  )
  fill.addColorStop(0, shade(colour, 0.35))
  fill.addColorStop(0.6, colour)
  fill.addColorStop(1, shade(colour, -0.35))

  return fill
}

/**
 * Brain coral: lit dome, meandering grooves
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintBrain = (pen: Pen, head: CoralHead): void => {
  const { x, y, size, colour, turn } = head
  pen.fillStyle = domeOf(pen, head, size)
  pen.beginPath()
  pen.arc(x, y, size, 0, Math.PI * 2)
  pen.fill()
  pen.save()
  pen.clip()
  pen.strokeStyle = shade(colour, -0.4)
  pen.lineWidth = size * 0.07
  pen.lineCap = 'round'
  pen.beginPath()
  for (let groove = -3; groove <= 3; groove += 1) {
    const offset = groove * size * 0.27
    for (let step = 0; step <= 12; step += 1) {
      const along = (step / 12 - 0.5) * size * 2.2
      const bend = Math.sin(step * 1.3 + groove * 2) * size * 0.1
      const px = x + Math.cos(turn) * along - Math.sin(turn) * (offset + bend)
      const py = y + Math.sin(turn) * along + Math.cos(turn) * (offset + bend)
      if (step) pen.lineTo(px, py)
      else pen.moveTo(px, py)
    }
  }
  pen.stroke()
  pen.restore()
}

/**
 * Staghorn: tapered forking branches, pale growing tips
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintStaghorn = (pen: Pen, { x, y, size, colour, turn, seed }: CoralHead): void => {
  const tips: Array<[number, number]> = []
  const grow = (fromX: number, fromY: number, angle: number, length: number, depth: number) => {
    const toX = fromX + Math.cos(angle) * length
    const toY = fromY + Math.sin(angle) * length
    pen.strokeStyle = shade(colour, -0.25 + depth * 0.12)
    pen.lineWidth = size * (0.2 - depth * 0.045)
    pen.beginPath()
    pen.moveTo(fromX, fromY)
    pen.lineTo(toX, toY)
    pen.stroke()
    if (depth === 2) return tips.push([toX, toY])
    for (const fork of [-0.5, 0.45]) {
      grow(toX, toY, angle + fork + Math.sin(seed + depth + fork) * 0.2, length * 0.68, depth + 1)
    }
  }
  pen.lineCap = 'round'
  for (let arm = 0; arm < 5; arm += 1) grow(x, y, turn + (arm / 5) * Math.PI * 2, size * 0.5, 0)
  pen.fillStyle = shade(colour, 0.45)
  for (const [tx, ty] of tips) {
    pen.beginPath()
    pen.arc(tx, ty, size * 0.06, 0, Math.PI * 2)
    pen.fill()
  }
}

/**
 * Table coral: a raised plate, its shadow on the sand, rays and a pale rim
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintTable = (pen: Pen, head: CoralHead): void => {
  const { x, y, size, colour, seed, sun } = head
  const plate = blob({ x, y, rx: size * 1.2, ry: size, seed, rough: 0.3 })
  pen.fillStyle = shade(colour, -0.65)
  pen.globalAlpha *= 0.5
  trace(pen, plate, -sun[0] * size * 0.35, -sun[1] * size * 0.35)
  pen.fill()
  pen.globalAlpha *= 2
  pen.fillStyle = domeOf(pen, head, size * 1.2)
  trace(pen, plate)
  pen.fill()
  pen.strokeStyle = shade(colour, -0.2)
  pen.lineWidth = size * 0.04
  pen.beginPath()
  for (let ray = 0; ray < 16; ray += 1) {
    const angle = (ray / 16) * Math.PI * 2
    pen.moveTo(x + Math.cos(angle) * size * 0.2, y + Math.sin(angle) * size * 0.18)
    pen.lineTo(x + Math.cos(angle) * size * 1.05, y + Math.sin(angle) * size * 0.88)
  }
  pen.stroke()
  pen.strokeStyle = shade(colour, 0.4)
  pen.lineWidth = size * 0.08
  trace(pen, plate)
  pen.stroke()
}

/**
 * Sea fan: a lacy fan, veins and cross mesh
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintFan = (pen: Pen, { x, y, size, colour, turn }: CoralHead): void => {
  const reach = size * 1.3
  pen.save()
  pen.globalAlpha *= 0.55
  pen.fillStyle = colour
  pen.beginPath()
  pen.moveTo(x, y)
  pen.arc(x, y, reach, turn, turn + Math.PI * 0.9)
  pen.closePath()
  pen.fill()
  pen.globalAlpha /= 0.55
  pen.strokeStyle = shade(colour, -0.25)
  pen.lineWidth = size * 0.05
  pen.beginPath()
  for (let vein = 0; vein <= 7; vein += 1) {
    const angle = turn + (vein / 7) * Math.PI * 0.9
    pen.moveTo(x, y)
    pen.lineTo(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach)
  }
  for (const ring of [0.35, 0.6, 0.85]) {
    pen.moveTo(x + Math.cos(turn) * reach * ring, y + Math.sin(turn) * reach * ring)
    pen.arc(x, y, reach * ring, turn, turn + Math.PI * 0.9)
  }
  pen.stroke()
  pen.restore()
}

/**
 * Tube sponges: a bunch of hollow tubes, dark mouths
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintTubes = (pen: Pen, head: CoralHead): void => {
  const { x, y, size, colour, turn } = head
  for (let tube = 0; tube < 5; tube += 1) {
    const angle = turn + tube * 1.26
    const reach = tube ? size * 0.55 : 0
    const radius = size * (tube ? 0.32 : 0.4)
    const tx = x + Math.cos(angle) * reach
    const ty = y + Math.sin(angle) * reach
    pen.fillStyle = domeOf(pen, { ...head, x: tx, y: ty }, radius)
    pen.beginPath()
    pen.arc(tx, ty, radius, 0, Math.PI * 2)
    pen.fill()
    pen.fillStyle = shade(colour, -0.6)
    pen.beginPath()
    pen.arc(tx, ty, radius * 0.5, 0, Math.PI * 2)
    pen.fill()
  }
}

/**
 * Anemone: tentacles fading to pale tips around an oral disc
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintAnemone = (pen: Pen, { x, y, size, colour, turn }: CoralHead): void => {
  pen.lineCap = 'round'
  for (const [reach, width, tone] of [
    [1, 0.16, -0.1],
    [0.8, 0.12, 0.35],
  ] as const) {
    pen.strokeStyle = shade(colour, tone)
    pen.lineWidth = size * width
    pen.beginPath()
    for (let arm = 0; arm < 18; arm += 1) {
      const angle = turn + (arm / 18) * Math.PI * 2
      const bend = angle + Math.sin(arm * 1.7) * 0.25
      pen.moveTo(x + Math.cos(angle) * size * 0.3, y + Math.sin(angle) * size * 0.3)
      pen.quadraticCurveTo(
        x + Math.cos(angle) * size * reach * 0.7,
        y + Math.sin(angle) * size * reach * 0.7,
        x + Math.cos(bend) * size * reach,
        y + Math.sin(bend) * size * reach
      )
    }
    pen.stroke()
  }
  pen.fillStyle = shade(colour, -0.35)
  pen.beginPath()
  pen.arc(x, y, size * 0.3, 0, Math.PI * 2)
  pen.fill()
}

/**
 * Soft coral: a ruffled cushion, paler at its heart
 * @param {Pen} pen - Pen
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintSoft = (pen: Pen, head: CoralHead): void => {
  const { x, y, size, colour, seed } = head
  const cushion = blob({ x, y, rx: size, ry: size * 0.85, seed, rough: 0.7 })
  pen.fillStyle = domeOf(pen, head, size)
  trace(pen, cushion)
  pen.fill()
  pen.strokeStyle = shade(colour, -0.3)
  pen.lineWidth = size * 0.06
  pen.stroke()
  pen.fillStyle = shade(colour, 0.5)
  for (let polyp = 0; polyp < 7; polyp += 1) {
    const angle = polyp * 2.4 + seed
    pen.beginPath()
    pen.arc(
      x + Math.cos(angle) * size * 0.45,
      y + Math.sin(angle) * size * 0.4,
      size * 0.07,
      0,
      Math.PI * 2
    )
    pen.fill()
  }
}

/**
 * Painter of each coral shape
 * @type {Record<CoralKind, (pen: Pen, head: CoralHead) => void>}
 */

export const CORAL_PAINTERS: Record<CoralKind, (pen: Pen, head: CoralHead) => void> = {
  brain: paintBrain,
  staghorn: paintStaghorn,
  table: paintTable,
  fan: paintFan,
  tubes: paintTubes,
  anemone: paintAnemone,
  soft: paintSoft,
}
