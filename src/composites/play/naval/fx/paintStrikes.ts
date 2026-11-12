import { ACTOR_PAINTERS } from '@/composites/play/naval/fx/actors'
import type { ActorScene } from '@/composites/play/naval/fx/actors'
import { paintImpact } from '@/composites/play/naval/fx/impact'
import { emitBurst } from '@/composites/play/naval/fx/particles'
import type { ParticlePool } from '@/composites/play/naval/fx/particles'
import { clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { progressOf } from '@/core/lib/play/naval/choreography'
import type { NavalTimeline } from '@/core/lib/play/naval/choreography'
import { isFlareCode, isHitCode, NavalCodes } from '@/core/lib/play/naval/state'
import type { NavalShotView, NavalStrikeView } from '@/core/lib/play/naval/state'
import { NAVAL_BURSTS } from '@/declarations/play/naval/choreographies'

/**
 * Strike on screen, laid on the clock
 * @typedef {Object} OceanStrike
 * @property {number} entry - Screen angle of the shooter
 */

export interface OceanStrike {
  strike: NavalStrikeView
  startedAt: number
  timeline: NavalTimeline
  entry: number
}

/**
 * Effects kept by one sea between frames
 * @typedef {Object} StrikeStage
 * @property {Map<number, number>} landed - Bursts thrown per revision
 */

export interface StrikeStage {
  pool: ParticlePool
  landed: Map<number, number>
}

// Screen shake after a hit, in milliseconds
const SHAKE_MS = 320
// Distance of the shooter off the sea, in sea widths
const OFF_SEA = 0.75

/**
 * Actor scene of a strike: where it comes from
 * @param {OceanFrame} frame - Frame
 * @param {OceanStrike} playing - Strike
 * @return {ActorScene} - Scene
 */

const sceneOf = (frame: OceanFrame, { strike, startedAt, timeline, entry }: OceanStrike) => {
  const half = (frame.size / 2) * frame.cell
  const angle = entry + timeline.entry
  const origin = {
    x: frame.left + half + Math.cos(angle) * frame.width * OFF_SEA,
    y: frame.top + half + Math.sin(angle) * frame.width * OFF_SEA,
  }

  return { frame, strike, timeline, age: frame.now - startedAt, origin, heading: angle + Math.PI }
}

/**
 * Burst of a square, none for a flare
 * @param {NavalShotView} cell - Square
 * @return {(typeof NAVAL_BURSTS)['hit'] | null} - Counts
 */

const burstOf = (cell: NavalShotView) => {
  if (isFlareCode(cell.code)) return null
  if (cell.code === NavalCodes.Sunk) return NAVAL_BURSTS.sunk

  return isHitCode(cell.code) ? NAVAL_BURSTS.hit : NAVAL_BURSTS.miss
}

/**
 * Landings of a strike: impacts, their particles once, the shake they give
 * @param {ActorScene} scene - Scene
 * @param {StrikeStage} stage - Sea effects
 * @return {number} - Shake share
 */

const paintLandings = (scene: ActorScene, stage: StrikeStage): number => {
  const { frame, strike, timeline, age } = scene
  const thrown = stage.landed.get(strike.rev) ?? 0
  const scale = NAVAL_BURSTS.takeScales[timeline.take] ?? 1
  let shake = 0
  timeline.landings.forEach((landing, index) => {
    const cell = strike.cells[index]
    const since = age - landing
    if (since < 0 || !cell) return
    if (since < timeline.impactMs) paintImpact(frame, cell, since, timeline)
    if (isHitCode(cell.code)) shake = Math.max(shake, 1 - clamp01(since / SHAKE_MS))

    // Particles once per square, none in the leanest tier
    const burst = burstOf(cell)
    if (index < thrown || !burst || frame.life <= 0) return
    emitBurst(stage.pool, burst, { x: cell.x + 0.5, y: cell.y + 0.5, scale })
  })
  const landed = timeline.landings.filter((landing) => landing <= age).length
  stage.landed.set(strike.rev, Math.max(thrown, landed))

  return shake
}

/**
 * Every strike on a sea: actors on their tracks, then the landings
 * @param {OceanFrame} frame - Frame
 * @param {OceanStrike[]} playing - Strikes on screen
 * @param {StrikeStage} stage - Sea effects
 * @return {number} - Screen shake share, zero to one
 */

export const paintStrikes = (
  frame: OceanFrame,
  playing: OceanStrike[],
  stage: StrikeStage
): number => {
  let shake = 0
  for (const entry of playing) {
    const scene = sceneOf(frame, entry)
    if (scene.age < 0) continue
    for (const span of scene.timeline.spans) {
      const progress = progressOf(span, scene.age)
      if (progress >= 0 && progress < 1) ACTOR_PAINTERS[span.track.actor](scene, span, progress)
    }
    shake = Math.max(shake, paintLandings(scene, stage))
  }

  // Forget strikes gone from the screen
  for (const rev of stage.landed.keys()) {
    if (!playing.some((entry) => entry.strike.rev === rev)) stage.landed.delete(rev)
  }

  return shake
}
