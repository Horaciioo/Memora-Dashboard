import { cellPoint, paintShadow } from '@/composites/play/naval/fx/actors/scene'
import type { ActorPainter, ActorScene, Point } from '@/composites/play/naval/fx/actors/scene'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'
import { NavalActors } from '@/utils/constants/play'

// Wingmen beside the leader, in squares
const WINGS = [-1, 0, 1]
// Height of the planes above the sea, in squares
const ALTITUDE = 1.2

/**
 * Flight of the planes: heading, and where they are along it at a clock
 * @param {ActorScene} scene - Scene
 * @return {{ unit: Point; at: (age: number) => Point }} - Path
 */

const flightOf = (scene: ActorScene) => {
  const { timeline, frame, heading } = scene
  const first = cellPoint(scene, 0)
  const last = cellPoint(scene, scene.strike.cells.length - 1)
  const length = Math.hypot(last.x - first.x, last.y - first.y)

  // Along the line in landing order, the shooter's heading for one square
  const unit =
    length > 0
      ? { x: (last.x - first.x) / length, y: (last.y - first.y) / length }
      : { x: Math.cos(heading), y: Math.sin(heading) }
  const start = first

  // Over each square when its bomb leaves
  const lead = timeline.spans.find((span) => span.track.actor === NavalActors.Bomb)?.track.lead ?? 0
  const releaseAt = (timeline.landings[0] ?? 0) - lead
  const timeSpan = (timeline.landings.at(-1) ?? 0) - (timeline.landings[0] ?? 0)
  const speed = Math.max(frame.width / 900, timeSpan > 0 ? length / timeSpan : 0)

  return {
    unit,
    at: (age: number): Point => ({
      x: start.x + unit.x * speed * (age - releaseAt),
      y: start.y + unit.y * speed * (age - releaseAt),
    }),
  }
}

/**
 * Three planes crossing over the line
 * @type {ActorPainter}
 */

export const paintPlane: ActorPainter = (scene) => {
  const { ctx, cell } = scene.frame
  const { unit, at } = flightOf(scene)
  const lead = at(scene.age)
  const angle = Math.atan2(unit.y, unit.x)
  for (const wing of WINGS) {
    const back = Math.abs(wing) * cell * 0.8
    const x = lead.x - unit.x * back - unit.y * wing * cell * 0.9
    const y = lead.y - unit.y * back + unit.x * wing * cell * 0.9
    paintShadow(scene.frame, { x: x + cell * 0.6, y: y + cell * 0.6 }, 1.6)
    ctx.save()
    ctx.translate(x, y - cell * ALTITUDE)
    ctx.rotate(angle)
    ctx.fillStyle = NAVAL_WATER.plane
    ctx.beginPath()
    ctx.moveTo(cell * 0.5, 0)
    ctx.lineTo(-cell * 0.3, -cell * 0.5)
    ctx.lineTo(-cell * 0.1, 0)
    ctx.lineTo(-cell * 0.3, cell * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}

/**
 * Bomb falling from the planes, a speed streak above it
 * @type {ActorPainter}
 */

export const paintBomb: ActorPainter = (scene, span, progress) => {
  const { ctx, cell, skin } = scene.frame
  const to = cellPoint(scene, span.cell)
  const height = (1 - progress * progress) * cell * ALTITUDE
  paintShadow(scene.frame, to, 0.3 + progress * 0.7)
  ctx.strokeStyle = skin.trail
  ctx.lineWidth = cell * 0.05
  ctx.beginPath()
  ctx.moveTo(to.x, to.y - height - cell * 0.4 * progress)
  ctx.lineTo(to.x, to.y - height)
  ctx.stroke()
  ctx.fillStyle = skin.shell
  ctx.beginPath()
  ctx.ellipse(to.x, to.y - height, cell * 0.08, cell * (0.12 - progress * 0.04), 0, 0, Math.PI * 2)
  ctx.fill()
}
