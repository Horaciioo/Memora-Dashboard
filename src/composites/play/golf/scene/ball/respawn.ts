import { pathAt, reachedEvent } from '@/core/lib/play/golf'
import type { GolfMotionTrack } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { respawn } = GOLF_SCENE

// Events that send a ball back
const LOST_KINDS = ['fall', 'splash']

export type GolfRespawnPhase = 'travel' | 'hang' | 'drop' | 'bounce' | 'done'

export interface GolfSpot {
  x: number
  y: number
  z: number
}

/**
 * Ball on its way back
 * @typedef {Object} GolfRespawnPose
 */

export interface GolfRespawnPose extends GolfSpot {
  phase: GolfRespawnPhase
  // Height stretch, below one squashes
  stretch: number
  // Share of the phase played
  progress: number
}

/**
 * Ease out, fast then gentle
 * @param {number} t - Zero to one
 * @return {number} - Eased
 */

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t)

/**
 * Spot of a lost ball coming back: travel up, hang, quick drop, small bounce
 * @param {number} ageMs - Since it was lost
 * @param {GolfSpot} from - Where it was lost
 * @param {GolfSpot} to - Spot it comes back to, on the ground
 * @return {GolfRespawnPose} - Spot and stretch
 */

export const respawnPose = (ageMs: number, from: GolfSpot, to: GolfSpot): GolfRespawnPose => {
  const top = to.y + respawn.height
  const hangAt = respawn.travelMs
  const dropAt = hangAt + respawn.hangMs
  const bounceAt = dropAt + respawn.dropMs
  const doneAt = bounceAt + respawn.bounceMs

  if (ageMs < hangAt) {
    const t = Math.max(0, ageMs) / respawn.travelMs
    const glide = easeOut(t)
    return {
      phase: 'travel',
      x: from.x + (to.x - from.x) * glide,
      y: Math.min(top, from.y + (top - from.y) * glide),
      z: from.z + (to.z - from.z) * glide,
      stretch: 1,
      progress: t,
    }
  }
  if (ageMs < dropAt) {
    return { phase: 'hang', ...to, y: top, stretch: 1, progress: (ageMs - hangAt) / respawn.hangMs }
  }
  if (ageMs < bounceAt) {
    const t = (ageMs - dropAt) / respawn.dropMs
    // Accelerating fall, stretched by speed
    return {
      phase: 'drop',
      ...to,
      y: top - respawn.height * t * t,
      stretch: 1 + respawn.squash * t,
      progress: t,
    }
  }
  if (ageMs < doneAt) {
    const t = (ageMs - bounceAt) / respawn.bounceMs
    const hop = respawn.height * respawn.bounce * 4 * t * (1 - t)
    // Squashed on impact, back round at the top
    return {
      phase: 'bounce',
      ...to,
      y: to.y + hop,
      stretch: 1 - respawn.squash * (1 - t) ** 2,
      progress: t,
    }
  }

  return { phase: 'done', ...to, stretch: 1, progress: 1 }
}

/**
 * Loss of a ball on its track: when, where, and its spot to come back to
 * @param {GolfMotionTrack | undefined} track - Track
 * @param {string} id - Ball
 * @param {number} now - Local ms
 * @return {{ ageMs: number, from: GolfSpot, to: GolfSpot } | null} - Loss
 */

export const lossOf = (
  track: GolfMotionTrack | undefined,
  id: string,
  now: number
): { ageMs: number; from: GolfSpot; to: GolfSpot } | null => {
  const event = track && reachedEvent(track, id, LOST_KINDS, now)
  if (!track || !event) return null

  return {
    ageMs: now - (track.startedAt + event.f * track.frameMs),
    from: pathAt(track.path, event.f),
    to: pathAt(track.path, 0),
  }
}

/**
 * Loss kept past its track
 * @typedef {Object} GolfLoss
 */

export interface GolfLoss {
  // Local ms it was lost
  at: number
  from: GolfSpot
  to: GolfSpot
}

/**
 * Pose of a ball still coming back, a short fade when motion is reduced
 * @param {GolfLoss | null} loss - Latest loss
 * @param {number} now - Local ms
 * @param {boolean} isReduced - Reduced motion asked
 * @return {(GolfRespawnPose & { grow: number }) | null} - Pose and size, null once back
 */

export const respawnAt = (
  loss: GolfLoss | null,
  now: number,
  isReduced: boolean
): (GolfRespawnPose & { grow: number }) | null => {
  if (!loss) return null
  const ageMs = now - loss.at
  if (isReduced) {
    return ageMs < respawn.fadeMs
      ? {
          phase: 'done',
          ...loss.to,
          stretch: 1,
          progress: 1,
          grow: Math.max(0, ageMs) / respawn.fadeMs,
        }
      : null
  }
  const pose = respawnPose(ageMs, loss.from, loss.to)

  return pose.phase === 'done' ? null : { ...pose, grow: 1 }
}
