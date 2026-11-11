import { clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { paintHull } from '@/composites/play/naval/ocean/paint/hull'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
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
  const { ctx, cell, now } = frame
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
    paintHull(frame, ship)
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
  const { ctx, cell } = frame
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
      paintHull(frame, entry.ship)
    }
    ctx.restore()
  }
}
