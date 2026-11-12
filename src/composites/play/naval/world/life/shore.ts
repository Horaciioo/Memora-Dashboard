import type { ActorPainter } from '@/composites/play/naval/world/life/types'

// Points along a flag edge
const CLOTH_STEPS = 8
// Streaks falling down a waterfall
const STREAKS = 5
// Squares a streak falls per second
const FALL_SPEED = 1.6

/**
 * Flag flapping from the top of its pole, a pale mark in its middle
 * @type {ActorPainter<'flag'>}
 */

export const paintFlag: ActorPainter<'flag'> = (pen, flag, seconds) => {
  const { x, y, size, cloth, mark, seed } = flag
  const width = size * 1.5
  const wave = (share: number) => Math.sin(share * 5 - seconds * 7 - seed) * size * 0.14 * share
  pen.save()
  pen.fillStyle = cloth
  pen.beginPath()
  pen.moveTo(x, y)
  for (let step = 1; step <= CLOTH_STEPS; step += 1) {
    const share = step / CLOTH_STEPS
    pen.lineTo(x + width * share, y + wave(share))
  }
  for (let step = CLOTH_STEPS; step >= 0; step -= 1) {
    const share = step / CLOTH_STEPS
    pen.lineTo(x + width * share, y + size + wave(share))
  }
  pen.closePath()
  pen.fill()
  const middle = { x: x + width * 0.5, y: y + size * 0.45 + wave(0.5) }
  pen.fillStyle = mark
  pen.strokeStyle = mark
  pen.lineWidth = size * 0.09
  pen.lineCap = 'round'
  pen.beginPath()
  pen.arc(middle.x, middle.y - size * 0.06, size * 0.17, 0, Math.PI * 2)
  pen.fill()
  pen.beginPath()
  pen.moveTo(middle.x - size * 0.28, middle.y + size * 0.08)
  pen.lineTo(middle.x + size * 0.28, middle.y + size * 0.34)
  pen.moveTo(middle.x + size * 0.28, middle.y + size * 0.08)
  pen.lineTo(middle.x - size * 0.28, middle.y + size * 0.34)
  pen.stroke()
  pen.restore()
}

/**
 * Waterfall: a pale sheet, streaks running down it and foam breathing at its foot
 * @type {ActorPainter<'fall'>}
 */

export const paintFall: ActorPainter<'fall'> = (pen, fall, seconds) => {
  const { x, y, dx, dy, width, colour, foam, seed } = fall
  const length = Math.hypot(dx, dy)
  pen.save()
  pen.translate(x, y)
  pen.rotate(Math.atan2(dy, dx) - Math.PI / 2)
  const sheet = pen.createLinearGradient(0, 0, 0, length)
  sheet.addColorStop(0, colour)
  sheet.addColorStop(1, foam)
  pen.fillStyle = sheet
  pen.globalAlpha = 0.9
  pen.beginPath()
  pen.moveTo(-width / 2, 0)
  pen.lineTo(width / 2, 0)
  pen.lineTo(width * 0.62, length)
  pen.lineTo(-width * 0.62, length)
  pen.closePath()
  pen.fill()
  pen.strokeStyle = foam
  pen.lineCap = 'round'
  pen.lineWidth = width * 0.09
  pen.setLineDash([length * 0.16, length * 0.22])
  for (let streak = 0; streak < STREAKS; streak += 1) {
    const across = (streak / (STREAKS - 1) - 0.5) * width * 0.8
    pen.lineDashOffset = -(seconds * FALL_SPEED + streak * 0.37 + seed) * length * 0.5
    pen.globalAlpha = 0.55 + (streak % 2) * 0.25
    pen.beginPath()
    pen.moveTo(across, 0)
    pen.lineTo(across * 1.2, length)
    pen.stroke()
  }
  pen.setLineDash([])
  const breath = 1 + Math.sin(seconds * 3 + seed) * 0.12
  const spray = pen.createRadialGradient(0, length, 0, 0, length, width * 1.4 * breath)
  spray.addColorStop(0, foam)
  spray.addColorStop(1, 'rgba(0,0,0,0)')
  pen.globalAlpha = 0.85
  pen.fillStyle = spray
  pen.beginPath()
  pen.ellipse(0, length, width * 1.4 * breath, width * 0.8 * breath, 0, 0, Math.PI * 2)
  pen.fill()
  pen.restore()
}

/**
 * Palm crown swaying in the breeze, coconuts at its heart
 * @type {ActorPainter<'crown'>}
 */

export const paintCrown: ActorPainter<'crown'> = (pen, crown, seconds) => {
  const { x, y, fronds, rib, heart, nuts, seed } = crown
  const sway = Math.sin(seconds * 1.2 + seed) * 0.06
  pen.save()
  pen.translate(x, y)
  fronds.forEach(({ length, angle, colour }, index) => {
    const flutter = Math.sin(seconds * 2.3 + index * 1.1 + seed) * 0.035
    const reach = length * (1 + Math.sin(seconds * 1.7 + index) * 0.03)
    pen.save()
    pen.rotate(angle + sway + flutter)
    pen.fillStyle = colour
    pen.beginPath()
    pen.moveTo(0, 0)
    pen.quadraticCurveTo(reach * 0.5, -reach * 0.26, reach, reach * 0.08)
    pen.quadraticCurveTo(reach * 0.5, reach * 0.12, 0, 0)
    pen.fill()
    pen.strokeStyle = rib
    pen.lineWidth = reach * 0.035
    pen.beginPath()
    pen.moveTo(0, 0)
    pen.quadraticCurveTo(reach * 0.5, -reach * 0.06, reach * 0.96, reach * 0.07)
    pen.stroke()
    pen.restore()
  })
  const core = (fronds[0]?.length ?? 1) * 0.12
  if (nuts) {
    pen.fillStyle = nuts
    for (let nut = 0; nut < 3; nut += 1) {
      const angle = (nut / 3) * Math.PI * 2 + seed
      pen.beginPath()
      pen.arc(
        Math.cos(angle) * core * 1.1,
        Math.sin(angle) * core * 1.1,
        core * 0.75,
        0,
        Math.PI * 2
      )
      pen.fill()
    }
  }
  pen.fillStyle = heart
  pen.beginPath()
  pen.arc(0, 0, core, 0, Math.PI * 2)
  pen.fill()
  pen.restore()
}
