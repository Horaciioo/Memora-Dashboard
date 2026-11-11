import { centreOf } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import type { NavalSpan, NavalTimeline } from '@/core/lib/play/naval/choreography'
import type { NavalStrikeView } from '@/core/lib/play/naval/state'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

export type Point = { x: number; y: number }

/**
 * What an actor paints from
 * @typedef {Object} ActorScene
 * @property {Point} origin - Off-sea start, toward the shooter
 * @property {number} heading - Angle into the sea
 */

export interface ActorScene {
  frame: OceanFrame
  strike: NavalStrikeView
  timeline: NavalTimeline
  age: number
  origin: Point
  heading: number
}

// One actor painter
export type ActorPainter = (scene: ActorScene, span: NavalSpan, progress: number) => void

/**
 * Pixel centre of a struck square
 * @param {ActorScene} scene - Scene
 * @param {number} index - Square order
 * @return {Point} - Pixels
 */

export const cellPoint = ({ frame, strike }: ActorScene, index: number): Point => {
  const cell = strike.cells[Math.max(0, index)] ?? strike.cells[0]

  return centreOf(frame, cell.x, cell.y)
}

/**
 * Departure of one projectile, spread along the shooter's edge
 * @param {ActorScene} scene - Scene
 * @param {number} index - Square order
 * @return {Point} - Pixels
 */

export const launchPoint = ({ origin, heading, frame }: ActorScene, index: number): Point => {
  const spread = index < 0 ? 0 : ((index % 5) - 2) * frame.cell * 0.9

  return {
    x: origin.x - Math.sin(heading) * spread,
    y: origin.y + Math.cos(heading) * spread,
  }
}

/**
 * Point of an arc above the sea
 * @param {Point} from - Start
 * @param {Point} to - End
 * @param {number} step - Zero to one
 * @param {number} lift - Height share
 * @return {{ x: number; ground: number; height: number }} - Ground and height
 */

export const arcPoint = (from: Point, to: Point, step: number, lift: number) => ({
  x: from.x + (to.x - from.x) * step,
  ground: from.y + (to.y - from.y) * step,
  height: Math.sin(Math.PI * step) * Math.hypot(to.x - from.x, to.y - from.y) * lift,
})

/**
 * Shadow under something in the air
 * @param {OceanFrame} frame - Frame
 * @param {Point} at - Ground point
 * @param {number} scale - Size share
 * @return {void}
 */

export const paintShadow = ({ ctx, cell }: OceanFrame, at: Point, scale: number): void => {
  ctx.fillStyle = NAVAL_WATER.shadow
  ctx.beginPath()
  ctx.ellipse(at.x, at.y, cell * 0.2 * scale, cell * 0.1 * scale, 0, 0, Math.PI * 2)
  ctx.fill()
}
