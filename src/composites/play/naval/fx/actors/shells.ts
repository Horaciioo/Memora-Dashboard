import {
  arcPoint,
  cellPoint,
  launchPoint,
  paintShadow,
} from '@/composites/play/naval/fx/actors/scene'
import type { ActorPainter, Point } from '@/composites/play/naval/fx/actors/scene'
import { clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import { drawHalo, haloSprite } from '@/composites/play/naval/ocean/sprites'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

// Mortar shell colours
const MORTAR = { body: '#5d6b3a', band: '#ff5a36' } as const
// Smoke dots behind a missile
const EXHAUST_DOTS = 6

/**
 * Point clamped inside the sea
 * @param {Point} at - Point
 * @param {number} width - Sea width
 * @return {Point} - Inside point
 */

const inside = (at: Point, width: number): Point => ({
  x: clamp01(at.x, 0, width),
  y: clamp01(at.y, 0, width),
})

/**
 * Flash of the guns where the shot enters the sea
 * @type {ActorPainter}
 */

export const paintMuzzle: ActorPainter = (scene, span, progress) => {
  const { ctx, cell, width, ratio } = scene.frame
  const at = inside(launchPoint(scene, span.cell), width)
  ctx.globalAlpha = 1 - progress
  drawHalo(ctx, haloSprite('flash', cell, ratio), at, cell * (2.2 + progress))
  ctx.globalAlpha = 1
}

/**
 * Shell in an arc, its shadow shrinking under it
 * @type {ActorPainter}
 */

export const paintShell: ActorPainter = (scene, span, progress) => {
  const { ctx, cell, width, skin } = scene.frame
  const from = launchPoint(scene, span.cell)
  const to = cellPoint(scene, span.cell)
  const now = arcPoint(from, to, progress, span.track.lift)
  const back = arcPoint(from, to, Math.max(0, progress - 0.1), span.track.lift)
  paintShadow(scene.frame, { x: now.x, y: now.ground }, progress)

  // Trail then shell, bigger when high
  ctx.strokeStyle = skin.trail
  ctx.lineWidth = cell * 0.08
  ctx.beginPath()
  ctx.moveTo(back.x, back.ground - back.height)
  ctx.lineTo(now.x, now.ground - now.height)
  ctx.stroke()
  ctx.fillStyle = skin.shell
  ctx.beginPath()
  ctx.arc(
    now.x,
    now.ground - now.height,
    cell * (0.14 + (0.1 * now.height) / width),
    0,
    Math.PI * 2
  )
  ctx.fill()
}

/**
 * Mortar shell, very high, spinning down
 * @type {ActorPainter}
 */

export const paintMortar: ActorPainter = (scene, span, progress) => {
  const { ctx, cell } = scene.frame
  const now = arcPoint(
    launchPoint(scene, span.cell),
    cellPoint(scene, span.cell),
    progress,
    span.track.lift
  )
  paintShadow(scene.frame, { x: now.x, y: now.ground }, 0.4 + progress * 0.6)
  ctx.save()
  ctx.translate(now.x, now.ground - now.height)
  ctx.rotate(progress * Math.PI * 7)
  ctx.fillStyle = MORTAR.body
  ctx.beginPath()
  ctx.ellipse(0, 0, cell * 0.17, cell * 0.22, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = MORTAR.band
  ctx.fillRect(-cell * 0.03, -cell * 0.3, cell * 0.06, cell * 0.12)
  ctx.restore()
}

/**
 * Missile on a bent path, smoke behind it
 * @type {ActorPainter}
 */

export const paintMissile: ActorPainter = (scene, span, progress) => {
  const { ctx, cell, skin } = scene.frame
  const from = launchPoint(scene, span.cell)
  const to = cellPoint(scene, span.cell)
  // Each missile bends its own way
  const bend = (span.cell % 2 ? 1 : -1) * span.track.lift
  const pointAt = (step: number): Point => {
    const sway = Math.sin(Math.PI * step) * bend * Math.hypot(to.x - from.x, to.y - from.y)
    const angle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2

    return {
      x: from.x + (to.x - from.x) * step + Math.cos(angle) * sway,
      y: from.y + (to.y - from.y) * step + Math.sin(angle) * sway,
    }
  }

  // Exhaust, oldest faintest
  ctx.fillStyle = NAVAL_WATER.exhaust
  for (let dot = EXHAUST_DOTS; dot > 0; dot -= 1) {
    const back = pointAt(Math.max(0, progress - dot * 0.035))
    ctx.globalAlpha = (1 - dot / EXHAUST_DOTS) * 0.8
    ctx.beginPath()
    ctx.arc(back.x, back.y, cell * (0.06 + dot * 0.03), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Body along its heading
  const head = pointAt(progress)
  const ahead = pointAt(Math.min(1, progress + 0.02))
  ctx.save()
  ctx.translate(head.x, head.y)
  ctx.rotate(Math.atan2(ahead.y - head.y, ahead.x - head.x))
  ctx.fillStyle = skin.shell
  ctx.fillRect(-cell * 0.22, -cell * 0.05, cell * 0.36, cell * 0.1)
  ctx.fillStyle = NAVAL_WATER.fire
  ctx.fillRect(-cell * 0.3, -cell * 0.03, cell * 0.08, cell * 0.06)
  ctx.restore()
}
