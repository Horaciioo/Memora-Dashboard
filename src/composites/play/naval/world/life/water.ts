import type { ActorPainter } from '@/composites/play/naval/world/life/types'

// Seconds of one bubble, from the floor to its pop
const BUBBLE_S = 2.6
const BUBBLES = 4
// Turns per second of a school around its reef
const SCHOOL_SPEED = 0.16

/**
 * School of fish circling under the surface, each one wagging its tail
 * @type {ActorPainter<'fish'>}
 */

export const paintFish: ActorPainter<'fish'> = (pen, school, seconds) => {
  const { x, y, rx, ry, count, size, colours, seed } = school
  const turn = seed * 1.3 + seconds * SCHOOL_SPEED * Math.PI * 2
  pen.save()
  pen.globalAlpha = 0.85
  for (let fish = 0; fish < count; fish += 1) {
    // Fish trail one another along the ring, a little scattered
    const angle = turn - fish * 0.16
    const spread = 1 + Math.sin(fish * 2.7 + seed) * 0.14
    const fx = x + Math.cos(angle) * rx * spread
    const fy = y + Math.sin(angle) * ry * spread
    const heading = Math.atan2(Math.cos(angle) * ry, -Math.sin(angle) * rx)
    const wag = Math.sin(seconds * 9 + fish) * 0.35
    pen.save()
    pen.translate(fx, fy)
    pen.rotate(heading)
    pen.fillStyle = colours[fish % colours.length]
    pen.beginPath()
    pen.ellipse(0, 0, size, size * 0.38, 0, 0, Math.PI * 2)
    pen.fill()
    pen.beginPath()
    pen.moveTo(-size * 0.8, 0)
    pen.lineTo(-size * 1.5, -size * (0.4 + wag * 0.3))
    pen.lineTo(-size * 1.5, size * (0.4 - wag * 0.3))
    pen.closePath()
    pen.fill()
    pen.restore()
  }
  pen.restore()
}

/**
 * Bubbles reaching the surface: small rings that widen and fade
 * @type {ActorPainter<'bubbles'>}
 */

export const paintBubbles: ActorPainter<'bubbles'> = (pen, spot, seconds) => {
  const { x, y, radius, colour, seed } = spot
  pen.save()
  pen.strokeStyle = colour
  pen.lineWidth = 0.025
  for (let bubble = 0; bubble < BUBBLES; bubble += 1) {
    const age = (seconds / BUBBLE_S + bubble / BUBBLES + seed * 0.13) % 1
    const bx = x + Math.cos(bubble * 2.4 + seed) * radius * 0.6
    const by = y + Math.sin(bubble * 1.9 + seed) * radius * 0.5
    pen.globalAlpha = (1 - age) * 0.8
    pen.beginPath()
    pen.arc(bx, by, 0.03 + age * 0.1, 0, Math.PI * 2)
    pen.stroke()
  }
  pen.restore()
}

/**
 * Sun sparkles dancing on the water, each one flaring and fading
 * @type {ActorPainter<'glints'>}
 */

export const paintGlints: ActorPainter<'glints'> = (pen, field, seconds) => {
  const { x, y, rx, ry, count, colour, seed } = field
  pen.save()
  pen.globalCompositeOperation = 'lighter'
  pen.strokeStyle = colour
  pen.lineCap = 'round'
  pen.lineWidth = 0.035
  for (let glint = 0; glint < count; glint += 1) {
    const flare = seconds ? Math.max(0, Math.sin(seconds * 2.2 + glint * 1.7 + seed)) ** 4 : 0.5
    if (flare < 0.05) continue
    const angle = glint * 2.39996 + seed
    const reach = Math.sqrt(((glint * 0.618 + seed * 0.1) % 1) * 0.9 + 0.1)
    const gx = x + Math.cos(angle) * rx * reach
    const gy = y + Math.sin(angle) * ry * reach
    const arm = 0.06 + flare * 0.14
    pen.globalAlpha = flare
    pen.beginPath()
    pen.moveTo(gx - arm, gy)
    pen.lineTo(gx + arm, gy)
    pen.moveTo(gx, gy - arm * 0.6)
    pen.lineTo(gx, gy + arm * 0.6)
    pen.stroke()
  }
  pen.restore()
}

/**
 * Buoy bobbing on its ripple, a pale band round its belly
 * @type {ActorPainter<'buoy'>}
 */

export const paintBuoy: ActorPainter<'buoy'> = (pen, buoy, seconds) => {
  const { x, y, size, colour, band, foam, seed } = buoy
  const bob = Math.sin(seconds * 1.7 + seed) * size * 0.18
  const lean = Math.sin(seconds * 1.1 + seed * 2) * 0.18
  const ripple = (seconds * 0.5 + seed * 0.3) % 1
  pen.save()
  pen.strokeStyle = foam
  pen.lineWidth = 0.03
  pen.globalAlpha = 0.6 * (1 - ripple)
  pen.beginPath()
  pen.ellipse(
    x,
    y + size * 0.4,
    size * (1.1 + ripple * 1.4),
    size * (0.5 + ripple * 0.6),
    0,
    0,
    Math.PI * 2
  )
  pen.stroke()
  pen.globalAlpha = 1
  pen.translate(x, y + bob)
  pen.rotate(lean)
  pen.fillStyle = colour
  pen.beginPath()
  pen.arc(0, 0, size, 0, Math.PI * 2)
  pen.fill()
  pen.fillStyle = band
  pen.fillRect(-size, -size * 0.18, size * 2, size * 0.36)
  pen.fillStyle = foam
  pen.globalAlpha = 0.45
  pen.beginPath()
  pen.arc(-size * 0.35, -size * 0.4, size * 0.28, 0, Math.PI * 2)
  pen.fill()
  pen.restore()
}
