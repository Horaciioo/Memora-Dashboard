import { freshLayer } from '@/composites/play/naval/ocean/layers'
import type { OceanLayer } from '@/composites/play/naval/ocean/layers'
import { frameOf } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { paintLiveMarks, paintStillMarks } from '@/composites/play/naval/ocean/paint/marks'
import { paintShips } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import { paintStrike } from '@/composites/play/naval/ocean/paint/strike'
import type { OceanStrike } from '@/composites/play/naval/ocean/paint/strike'
import { paintStillWater, paintSwell } from '@/composites/play/naval/ocean/paint/water'
import { paintNearGrid, paintZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanCell } from '@/composites/play/naval/ocean/useOceanGestures'
import type { NavalCamera } from '@/core/lib/play/naval/camera'
import type { NavalTier } from '@/core/lib/play/naval/quality'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import type { NavalSkin } from '@/declarations/play/naval/skins'

/**
 * Everything a sea paints
 * @typedef {Object} OceanScene
 */

export interface OceanScene {
  size: number
  camera: NavalCamera
  marks: SeaMark[]
  ships: OceanShip[]
  skin: NavalSkin
  hover: OceanCell | null
  zone: OceanZone | null
  playing: OceanStrike | null
}

/**
 * Pen of one sea and its cached layers
 * @typedef {Object} OceanPen
 */

export interface OceanPen {
  ctx: CanvasRenderingContext2D
  width: number
  ratio: number
  still: OceanLayer
  marked: OceanLayer
  // Ship key to the clock it sank
  sinking: Map<string, number>
  isFirst: boolean
  // Marks last painted in the layer, and their version
  marks: Uint8Array
  marksVersion: number
}

/**
 * Wrecks seen go down once, those already down lie still
 * @param {OceanPen} pen - Pen
 * @param {OceanShip[]} ships - Ships
 * @param {number} now - Clock
 * @return {OceanShip[]} - Ships with their sinking clock
 */

const withSinking = ({ sinking, isFirst }: OceanPen, ships: OceanShip[], now: number) =>
  ships.map((entry) => {
    if (!entry.isWreck) return entry
    const key = `${entry.ship.id}:${entry.ship.x}:${entry.ship.y}`
    if (!sinking.has(key)) sinking.set(key, isFirst ? -Infinity : now)
    const from = sinking.get(key) ?? -Infinity

    return Number.isFinite(from) ? { ...entry, sinkFrom: from } : entry
  })

/**
 * Version of the marks, bumped only when a square changed
 * @param {OceanPen} pen - Pen
 * @param {SeaMark[]} marks - Marks
 * @return {number} - Version
 */

const marksVersionOf = (pen: OceanPen, marks: SeaMark[]): number => {
  const isSame = pen.marks.length === marks.length && marks.every((mark, i) => pen.marks[i] === mark)
  if (isSame) return pen.marksVersion
  pen.marks = Uint8Array.from(marks)
  pen.marksVersion += 1

  return pen.marksVersion
}

/**
 * Still water and misses copied from their layers
 * @param {OceanPen} pen - Pen
 * @param {OceanFrame} frame - Frame
 * @param {OceanScene} scene - Scene
 * @return {() => void} - Paints the misses layer, after the ships
 */

const paintLayers = (pen: OceanPen, frame: OceanFrame, { camera, marks }: OceanScene) => {
  const key = `${pen.width}|${pen.ratio}|${camera.x},${camera.y},${camera.span}|${frame.size}|${frame.life ? 1 : 0}`
  const water = freshLayer(pen.still, key, pen, (ctx) => paintStillWater({ ...frame, ctx, now: 0 }))
  pen.ctx.drawImage(water, 0, 0, pen.width, pen.width)

  return () => {
    const marksKey = `${key}|${marksVersionOf(pen, marks)}`
    const misses = freshLayer(pen.marked, marksKey, pen, (ctx) =>
      paintStillMarks({ ...frame, ctx }, marks)
    )
    pen.ctx.drawImage(misses, 0, 0, pen.width, pen.width)
  }
}

/**
 * One frame of a sea, layer by layer
 * @param {OceanPen} pen - Pen
 * @param {OceanScene} scene - Scene
 * @param {number} now - Clock
 * @param {NavalTier} tier - Effect tier
 * @return {number} - Screen shake share of the strike, zero to one
 */

export const paintOcean = (pen: OceanPen, scene: OceanScene, now: number, tier: NavalTier) => {
  const { ctx, width, ratio } = pen
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  const base = { ctx, width, size: scene.size, now, skin: scene.skin, ratio, life: tier.life }
  const frame = frameOf(base, scene.camera)
  const paintMisses = paintLayers(pen, frame, scene)
  if (frame.life) paintSwell(frame)
  if (scene.hover) paintNearGrid(frame, scene.hover)
  paintShips(frame, withSinking(pen, scene.ships, now))
  paintMisses()
  paintLiveMarks(frame, scene.marks)
  if (scene.zone) paintZone(frame, scene.zone)
  pen.isFirst = false

  return scene.playing ? paintStrike(frame, scene.playing) : 0
}
