import { clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { NavalBows, NavalRigs } from '@/declarations/play/naval/skins'
import type { NavalSkin } from '@/declarations/play/naval/skins'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

/**
 * Ship to paint and its state
 * @typedef {Object} OceanShip
 */

export interface OceanShip {
  ship: NavalShip
  isWreck?: boolean
  isGhost?: boolean
  // Clock the ship started to sink, none when it lies still
  sinkFrom?: number
}

// Length of the sinking, in milliseconds
export const SINK_MS = 1800

/**
 * Hull outline along the x axis, from 0 to the length
 * @param {CanvasRenderingContext2D} ctx - Pen
 * @param {number} length - Pixels
 * @param {number} beam - Width in pixels
 * @param {NavalSkin} skin - Skin
 * @return {void}
 */

const hullPath = (ctx: CanvasRenderingContext2D, length: number, beam: number, skin: NavalSkin) => {
  const half = beam / 2
  const bow =
    skin.bow === NavalBows.Pointed
      ? beam * 1.1
      : skin.bow === NavalBows.Round
        ? beam * 0.7
        : beam * 0.2
  ctx.beginPath()
  ctx.moveTo(beam * 0.3, -half)
  ctx.lineTo(length - bow, -half)
  if (skin.bow === NavalBows.Square) ctx.lineTo(length, -half * 0.7)
  ctx.quadraticCurveTo(length, 0, length, 0)
  ctx.quadraticCurveTo(length - bow * 0.1, half * 0.9, length - bow, half)
  ctx.lineTo(beam * 0.3, half)
  ctx.quadraticCurveTo(0, half, 0, 0)
  ctx.quadraticCurveTo(0, -half, beam * 0.3, -half)
  ctx.closePath()
}

/**
 * Deck pieces of a skin, spread along the ship
 * @param {CanvasRenderingContext2D} ctx - Pen
 * @param {number} squares - Ship length in squares
 * @param {number} cell - Pixels per square
 * @param {NavalSkin} skin - Skin
 * @return {void}
 */

const paintRig = (
  ctx: CanvasRenderingContext2D,
  squares: number,
  cell: number,
  skin: NavalSkin
) => {
  const pieces = skin.rig === NavalRigs.Studs ? squares * 2 : Math.max(1, squares - 1)
  for (let index = 0; index < pieces; index += 1) {
    const x = ((index + 0.5) / pieces) * squares * cell * 0.86 + cell * 0.1
    if (skin.rig === NavalRigs.Turrets) {
      ctx.fillStyle = skin.dark
      ctx.fillRect(x, -cell * 0.05, cell * 0.38, cell * 0.1)
      ctx.fillStyle = skin.top
      ctx.beginPath()
      ctx.arc(x, 0, cell * 0.16, 0, Math.PI * 2)
      ctx.fill()
    }
    if (skin.rig === NavalRigs.Masts) {
      ctx.fillStyle = skin.top
      ctx.beginPath()
      ctx.ellipse(x, 0, cell * 0.12, cell * 0.36, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = skin.dark
      ctx.fillRect(x - cell * 0.03, -cell * 0.38, cell * 0.06, cell * 0.76)
    }
    if (skin.rig === NavalRigs.Fins) {
      ctx.fillStyle = skin.top
      ctx.beginPath()
      ctx.moveTo(x - cell * 0.2, -cell * 0.08)
      ctx.lineTo(x + cell * 0.2, 0)
      ctx.lineTo(x - cell * 0.2, cell * 0.08)
      ctx.closePath()
      ctx.fill()
    }
    if (skin.rig === NavalRigs.Studs) {
      ctx.fillStyle = skin.top
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(x * 0.98, side * cell * 0.13, cell * 0.08, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

/**
 * One ship drawn in its local frame, bow to the right
 * @param {OceanFrame} frame - Frame
 * @param {number} squares - Length in squares
 * @param {NavalSkin} skin - Skin
 * @return {void}
 */

const paintHull = (frame: OceanFrame, squares: number, skin: NavalSkin): void => {
  const { ctx, cell } = frame
  const length = squares * cell - cell * 0.12
  const beam = cell * 0.62
  ctx.save()
  ctx.translate(cell * 0.06, 0)
  if (skin.glow) {
    ctx.shadowColor = skin.glow
    ctx.shadowBlur = cell * 0.35
  }
  hullPath(ctx, length, beam, skin)
  ctx.fillStyle = skin.hull
  ctx.fill()
  ctx.shadowBlur = 0
  hullPath(ctx, length - cell * 0.2, beam * 0.7, skin)
  ctx.save()
  ctx.translate(cell * 0.1, 0)
  ctx.fillStyle = skin.deck
  ctx.fill()
  ctx.restore()
  paintRig(ctx, squares, cell, skin)
  ctx.restore()
}

/**
 * Pose of a ship: centre, angle, swell
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @return {{ x: number; y: number; angle: number; bob: number }} - Pose
 */

const poseOf = ({ cell, left, top, now }: OceanFrame, ship: NavalShip) => {
  const phase = ship.id * 1.7 + ship.x * 0.3
  const across = ship.isHorizontal ? ship.length : 1
  const down = ship.isHorizontal ? 1 : ship.length

  return {
    x: left + (ship.x + across / 2) * cell,
    y: top + (ship.y + down / 2) * cell,
    angle: ship.isHorizontal ? 0 : Math.PI / 2,
    bob: Math.sin(now / 1300 + phase),
  }
}

/**
 * A wreck: hull broken in two, halves leaning apart and going under
 * @param {OceanFrame} frame - Frame
 * @param {OceanShip} entry - Ship
 * @return {void}
 */

const paintWreck = (frame: OceanFrame, { ship, sinkFrom }: OceanShip): void => {
  const { ctx, cell, now, skin } = frame
  const sunk = sinkFrom === undefined ? 1 : clamp01((now - sinkFrom) / SINK_MS)
  const span = ship.length * cell
  for (const side of [-1, 1]) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(side < 0 ? -span / 2 : 0, -cell, span / 2, cell * 2)
    ctx.clip()
    ctx.translate(side * sunk * cell * 0.12, sunk * cell * 0.05)
    ctx.rotate(side * sunk * 0.16)
    ctx.translate(-span / 2, 0)
    ctx.globalAlpha = 1 - sunk * 0.55
    paintHull(frame, ship.length, skin)
    ctx.restore()
  }
  ctx.globalAlpha = sunk * 0.45
  ctx.fillStyle = NAVAL_WATER.deep
  ctx.fillRect(-span / 2, -cell / 2, span, cell)
  ctx.globalAlpha = 1
}

/**
 * Ships of a sea, each rocking on its own phase
 * @param {OceanFrame} frame - Frame
 * @param {OceanShip[]} ships - Ships
 * @return {void}
 */

export const paintShips = (frame: OceanFrame, ships: OceanShip[]): void => {
  const { ctx, cell, skin } = frame
  for (const entry of ships) {
    const pose = poseOf(frame, entry.ship)
    ctx.save()
    ctx.translate(pose.x, pose.y + (entry.isWreck ? 0 : pose.bob * cell * 0.03))
    ctx.rotate(pose.angle + (entry.isWreck ? 0 : pose.bob * 0.025))
    ctx.globalAlpha = entry.isGhost ? 0.5 : 1
    ctx.fillStyle = NAVAL_WATER.shadow
    ctx.fillRect(
      -(entry.ship.length * cell) / 2 + cell * 0.1,
      cell * 0.22,
      entry.ship.length * cell - cell * 0.2,
      cell * 0.12
    )
    if (entry.isWreck) paintWreck(frame, entry)
    else {
      ctx.translate(-(entry.ship.length * cell) / 2, 0)
      paintHull(frame, entry.ship.length, skin)
    }
    ctx.restore()
  }
}
