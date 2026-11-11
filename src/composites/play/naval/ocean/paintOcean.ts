import { followOf } from '@/composites/play/naval/fx/follow'
import { useNavalPrefsStore } from '@/core/store/play/navalPrefs'
import { paintStrikes } from '@/composites/play/naval/fx/paintStrikes'
import type { OceanStrike, StrikeStage } from '@/composites/play/naval/fx/paintStrikes'
import {
  createParticles,
  emit,
  paintParticles,
  ParticleKinds,
  stepParticles,
} from '@/composites/play/naval/fx/particles'
import { heavySquares, landedMarks, withJolts } from '@/composites/play/naval/fx/reveal'
import { blankLayer, freshLayer } from '@/composites/play/naval/ocean/layers'
import type { OceanLayer } from '@/composites/play/naval/ocean/layers'
import { frameOf } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { paintLiveMarks, paintStillMarks } from '@/composites/play/naval/ocean/paint/marks'
import { paintShips, paintWrecks, sunkOf } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import { paintStillWater, paintSwell } from '@/composites/play/naval/ocean/paint/water'
import { paintNearGrid, paintZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanCell } from '@/composites/play/naval/ocean/useOceanGestures'
import type { StageWorld } from '@/composites/play/naval/world/stage'
import type { NavalCamera } from '@/core/lib/play/naval/camera'
import type { NavalTier } from '@/core/lib/play/naval/quality'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { NAVAL_BURSTS } from '@/declarations/play/naval/choreographies'
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
  playing: OceanStrike[]
  // Map drawn around the sea, plain water until it is fetched
  world: StageWorld | null
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
  stage: StrikeStage
  paintedAt: number
}

/**
 * Pen of a canvas, nothing painted yet
 * @param {CanvasRenderingContext2D} ctx - Canvas pen
 * @param {number} width - Pixels across
 * @return {OceanPen} - Pen
 */

export const createPen = (ctx: CanvasRenderingContext2D, width: number): OceanPen => ({
  ctx,
  width,
  ratio: 1,
  still: blankLayer(),
  marked: blankLayer(),
  sinking: new Map(),
  isFirst: true,
  marks: new Uint8Array(),
  marksVersion: 0,
  stage: { pool: createParticles(0), landed: new Map() },
  paintedAt: 0,
})

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
    if (entry.sinkFrom !== undefined) sinking.set(key, entry.sinkFrom)
    if (!sinking.has(key)) sinking.set(key, isFirst ? -Infinity : now)
    const from = sinking.get(key) ?? -Infinity

    return Number.isFinite(from) ? { ...entry, sinkFrom: from } : { ...entry, sinkFrom: undefined }
  })

/**
 * Version of the marks and wrecks, bumped only when one changed
 * @param {OceanPen} pen - Pen
 * @param {SeaMark[]} marks - Marks
 * @return {number} - Version
 */

const marksVersionOf = (pen: OceanPen, marks: SeaMark[]): number => {
  const isSame =
    pen.marks.length === marks.length && marks.every((mark, i) => pen.marks[i] === mark)
  if (isSame) return pen.marksVersion
  pen.marks = Uint8Array.from(marks)
  pen.marksVersion += 1

  return pen.marksVersion
}

/**
 * Still water, then misses and wrecks at rest, copied from their layers
 * @param {OceanPen} pen - Pen
 * @param {OceanFrame} frame - Frame
 * @param {Object} input - Content
 * @param {OceanScene} input.scene - Scene
 * @param {SeaMark[]} input.marks - Marks shown
 * @param {OceanShip[]} input.wrecks - Wrecks at rest
 * @return {() => void} - Paints the marks layer, after the ships
 */

const paintLayers = (
  pen: OceanPen,
  frame: OceanFrame,
  { scene, marks, wrecks }: { scene: OceanScene; marks: SeaMark[]; wrecks: OceanShip[] }
) => {
  const { camera, world } = scene
  const key = `${pen.width}|${pen.ratio}|${camera.x},${camera.y},${camera.span}|${frame.size}|${frame.life ? 1 : 0}|${world?.key ?? ''}`
  const water = freshLayer(pen.still, key, pen, (ctx) =>
    paintStillWater({ ...frame, ctx, now: 0 }, world)
  )
  pen.ctx.drawImage(water, 0, 0, pen.width, pen.width)

  return () => {
    const down = wrecks.map(({ ship }) => ship.id).join(',')
    const marksKey = `${key}|${marksVersionOf(pen, marks)}|${down}`
    const still = freshLayer(pen.marked, marksKey, pen, (ctx) => {
      paintWrecks({ ...frame, ctx }, wrecks)
      paintStillMarks({ ...frame, ctx }, marks)
    })
    pen.ctx.drawImage(still, 0, 0, pen.width, pen.width)
  }
}

/**
 * Particles: bubbles over the ships going down, then every live one
 * @param {OceanPen} pen - Pen
 * @param {OceanFrame} frame - Frame
 * @param {OceanShip[]} sinking - Ships going down
 * @return {void}
 */

const paintEffects = (pen: OceanPen, frame: OceanFrame, sinking: OceanShip[]): void => {
  const { pool } = pen.stage
  const ms = pen.paintedAt ? frame.now - pen.paintedAt : 0
  pen.paintedAt = frame.now
  if (frame.life > 0) {
    for (const { ship } of sinking) {
      if (Math.random() > (ms / 1000) * NAVAL_BURSTS.sinkBubbles) continue
      const along = Math.random() * ship.length
      const x = ship.x + (ship.isHorizontal ? along : 0.5)
      const y = ship.y + (ship.isHorizontal ? 0.5 : along)
      emit(pool, ParticleKinds.Bubble, { x, y, count: 1 })
    }
  }
  stepParticles(pool, ms)
  paintParticles(frame, pool)
}

/**
 * One frame of a sea, layer by layer
 * @param {OceanPen} pen - Pen
 * @param {OceanScene} scene - Scene
 * @param {number} now - Clock
 * @param {NavalTier} tier - Effect tier
 * @return {number} - Screen shake share of the strikes
 */

export const paintOcean = (pen: OceanPen, scene: OceanScene, now: number, tier: NavalTier) => {
  const { ctx, width, ratio } = pen
  if (pen.stage.pool.capacity !== Math.max(1, tier.particles)) {
    pen.stage.pool = createParticles(tier.particles)
  }
  const base = { ctx, width, size: scene.size, now, skin: scene.skin, ratio, life: tier.life }
  const frame = frameOf(base, scene.camera)

  // Camera leans toward the strike
  const follow =
    tier.follow && useNavalPrefsStore.getState().hasAutoZoom
      ? followOf(frame, scene.playing[0])
      : null
  const zoom = follow?.zoom ?? 1
  const shift = (1 - zoom) * ratio
  ctx.setTransform(
    ratio * zoom,
    0,
    0,
    ratio * zoom,
    (follow?.x ?? 0) * shift,
    (follow?.y ?? 0) * shift
  )

  // Squares in flight stay hidden until they land
  const marks = landedMarks(scene.marks, scene.playing, now, scene.size)
  const ships = withJolts(withSinking(pen, scene.ships, now), scene.playing, now)
  const wrecks = ships.filter((entry) => sunkOf(entry, now) >= 1)
  const moving = ships.filter((entry) => sunkOf(entry, now) < 1)
  const paintStill = paintLayers(pen, frame, { scene, marks, wrecks })
  if (frame.life && scene.world) scene.world.paintLife(frame)
  if (frame.life) paintSwell(frame)
  if (scene.hover) paintNearGrid(frame, scene.hover)
  paintShips(frame, moving, marks)
  paintStill()
  paintLiveMarks(frame, marks, heavySquares(moving, marks, scene.size))
  if (scene.zone) paintZone(frame, scene.zone)
  pen.isFirst = false
  const shake = paintStrikes(frame, scene.playing, pen.stage)
  paintEffects(
    pen,
    frame,
    moving.filter((entry) => sunkOf(entry, now) >= 0)
  )

  return shake
}
