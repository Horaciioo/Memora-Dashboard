import { pathAt, pathLength } from '@/core/lib/play/golf/physics/frames'
import type { GolfBallMotion, GolfShotResult } from '@/core/lib/play/golf/types'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Stroke still rolling, as stored
 * @typedef {Object} GolfRunningShot
 */

export interface GolfRunningShot {
  // Server ms of frame zero
  at: number
  track: Pick<GolfShotResult, 'frameMs' | 'frames' | 'paths'>
}

/**
 * Spot and speed of a ball on its running track
 * @param {GolfRunningShot} shot - Stroke
 * @param {string} id - Ball
 * @param {number} at - Server ms
 * @return {{ x: number, z: number, motion: GolfBallMotion } | null} - State, none once stopped
 */

export const motionAt = (
  shot: GolfRunningShot,
  id: string,
  at: number
): { x: number; z: number; motion: GolfBallMotion } | null => {
  const path = shot.track.paths[id]
  if (!path) return null
  const last = pathLength(path) - 1
  const frame = (at - shot.at) / shot.track.frameMs
  if (frame < 0 || frame >= last) return null

  // Central difference, one frame each side
  const spot = pathAt(path, frame)
  const before = Math.max(0, frame - 1)
  const after = Math.min(last, frame + 1)
  const from = pathAt(path, before)
  const to = pathAt(path, after)
  const seconds = ((after - before) * shot.track.frameMs) / SECOND_MS

  return {
    x: spot.x,
    z: spot.z,
    motion: {
      vx: (to.x - from.x) / seconds,
      vz: (to.z - from.z) / seconds,
      vy: (to.y - from.y) / seconds,
      y: spot.y,
    },
  }
}

/**
 * Latest running stroke carrying a ball
 * @param {T[]} shots - Strokes, newest first
 * @param {string} id - Ball
 * @return {T | undefined} - Stroke
 */

export const runningShotOf = <T extends GolfRunningShot>(shots: T[], id: string): T | undefined =>
  shots.find((shot) => Boolean(shot.track.paths[id]))
