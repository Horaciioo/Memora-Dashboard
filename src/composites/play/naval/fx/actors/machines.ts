import type { ActorPainter } from '@/composites/play/naval/fx/actors/scene'
import { centreOf, clamp01, noise } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import type { NavalStrikeView } from '@/core/lib/play/naval/state'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Colours of the machines, kept here as they belong to no other layer
const MACHINE = {
  body: '#37463d',
  glass: '#9be4f2',
  sub: '#2c4a52',
  subTop: '#3e6670',
  tracer: '#ffd66b',
  rotorDisc: 'rgba(255,255,255,0.28)',
  blade: 'rgba(20,24,28,0.8)',
} as const

// Size of the machines against a square
const MACHINE_SCALE = { heli: 1.9, sub: 1.5 } as const

// Rotor turn speed, in milliseconds per radian
const ROTOR_MS = 22
// How long a tracer stays drawn, in milliseconds
const TRACER_MS = 140

/**
 * Pixel ends of a strike line and its heading
 * @param {OceanFrame} frame - Frame
 * @param {NavalStrikeView} strike - Strike
 * @return {{ from: Point; to: Point; angle: number }} - Ends and angle
 */

const lineOf = (frame: OceanFrame, strike: NavalStrikeView) => {
  const first = strike.cells[0]
  const last = strike.cells.at(-1) ?? first
  const from = centreOf(frame, first.x, first.y)
  const to = centreOf(frame, last.x, last.y)

  return { from, to, angle: Math.atan2(to.y - from.y, to.x - from.x) }
}

/**
 * Combat helicopter sweeping the whole line, tracers falling on each square as it passes
 * @type {ActorPainter}
 */

export const paintGunship: ActorPainter = ({ frame, strike, age, timeline }) => {
  const { ctx, cell, now } = frame
  const { landings } = timeline
  const { from, to, angle } = lineOf(frame, strike)
  const first = landings[0]
  const lastAt = landings.at(-1) ?? first
  const run = (age - first) / Math.max(1, lastAt - first)
  // Enters and leaves the sea a little beyond both ends
  const along = -0.06 + clamp01((age - first + 600) / (lastAt - first + 1200)) * 1.12
  if (age < first - 600 || run > 1.4) return
  const at = { x: from.x + (to.x - from.x) * along, y: from.y + (to.y - from.y) * along }

  // Tracers down on the squares just struck
  strike.cells.forEach((cellView, index) => {
    const since = age - landings[index]
    if (since < 0 || since > TRACER_MS) return
    const target = centreOf(frame, cellView.x, cellView.y)
    ctx.globalAlpha = 1 - since / TRACER_MS
    ctx.strokeStyle = MACHINE.tracer
    ctx.lineWidth = cell * 0.07
    ctx.beginPath()
    ctx.moveTo(at.x, at.y)
    ctx.lineTo(target.x, target.y)
    ctx.stroke()
    ctx.globalAlpha = 1
  })

  const big = cell * MACHINE_SCALE.heli
  // Shadow, tail, body, glass, rotor
  ctx.fillStyle = NAVAL_WATER.shadow
  ctx.beginPath()
  ctx.ellipse(at.x + big * 0.7, at.y + big * 0.7, big * 0.6, big * 0.2, angle, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(at.x, at.y)
  ctx.rotate(angle)
  ctx.fillStyle = MACHINE.body
  ctx.fillRect(-big * 1.25, -big * 0.05, big * 0.8, big * 0.1)
  ctx.beginPath()
  ctx.ellipse(0, 0, big * 0.55, big * 0.24, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = MACHINE.glass
  ctx.beginPath()
  ctx.ellipse(big * 0.3, 0, big * 0.2, big * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = MACHINE.rotorDisc
  ctx.lineWidth = big * 0.05
  ctx.beginPath()
  ctx.arc(at.x, at.y, big * 0.85, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = MACHINE.blade
  ctx.lineWidth = big * 0.09
  for (const blade of [0, Math.PI / 2]) {
    const turn = now / ROTOR_MS + blade
    ctx.beginPath()
    ctx.moveTo(at.x - Math.cos(turn) * big * 0.85, at.y - Math.sin(turn) * big * 0.85)
    ctx.lineTo(at.x + Math.cos(turn) * big * 0.85, at.y + Math.sin(turn) * big * 0.85)
    ctx.stroke()
  }
}

/**
 * Submarine surfacing behind the line, its torpedoes running along it
 * @type {ActorPainter}
 */

export const paintSubmarine: ActorPainter = ({ frame, strike, age, timeline }) => {
  const { ctx, cell, now } = frame
  const { landings } = timeline
  const { from, to, angle } = lineOf(frame, strike)
  const unit = { x: Math.cos(angle), y: Math.sin(angle) }
  const base = { x: from.x - unit.x * cell * 1.4, y: from.y - unit.y * cell * 1.4 }
  const end = landings.at(-1) ?? 0
  const surfaced = clamp01(age / 350) * (1 - clamp01((age - end) / 500))
  if (surfaced <= 0) return

  const big = cell * MACHINE_SCALE.sub
  // Foam ring, hull, conning tower and periscope
  ctx.globalAlpha = surfaced
  ctx.strokeStyle = NAVAL_WATER.foam
  ctx.lineWidth = big * 0.06
  ctx.beginPath()
  ctx.ellipse(base.x, base.y, big * 1.35, big * 0.55, angle, 0, Math.PI * 2)
  ctx.stroke()
  ctx.save()
  ctx.translate(base.x, base.y)
  ctx.rotate(angle)
  ctx.fillStyle = MACHINE.sub
  ctx.beginPath()
  ctx.ellipse(0, 0, big * 1.1, big * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = MACHINE.subTop
  ctx.fillRect(-big * 0.2, -big * 0.17, big * 0.5, big * 0.34)
  ctx.fillStyle = NAVAL_WATER.foam
  ctx.fillRect(big * 0.1, -big * 0.02, big * 0.35, big * 0.04)
  ctx.restore()
  for (let bubble = 0; bubble < 5; bubble += 1) {
    const life = (now / 900 + noise(bubble)) % 1
    ctx.beginPath()
    ctx.arc(
      base.x + (noise(bubble + 3) - 0.5) * big * 1.6,
      base.y - life * big * 0.9,
      big * 0.05 * (1 - life * 0.5),
      0,
      Math.PI * 2
    )
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Torpedoes: wake along the line, a head leading it
  const run = clamp01((age - 300) / Math.max(1, end - 300))
  const head = { x: base.x + (to.x - base.x) * run, y: base.y + (to.y - base.y) * run }
  ctx.strokeStyle = NAVAL_WATER.wake
  ctx.lineCap = 'round'
  ctx.lineWidth = cell * 0.16
  ctx.globalAlpha = 0.65
  ctx.beginPath()
  ctx.moveTo(base.x, base.y)
  ctx.lineTo(head.x, head.y)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = frame.skin.shell
  ctx.beginPath()
  ctx.ellipse(head.x, head.y, cell * 0.2, cell * 0.08, angle, 0, Math.PI * 2)
  ctx.fill()
}
