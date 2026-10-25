import { Vector3 } from 'three'

import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { camera } = GOLF_SETTINGS

/**
 * Camera and ball spots shared inside the canvas
 * @typedef {Object} GolfRig
 */

export interface GolfRig {
  // Look direction, zero toward +z
  yaw: number
  distance: number
  isOverview: boolean
  // Held keys, turn and zoom
  turn: number
  zoom: number
  // Smoothed point looked at
  target: Vector3
  // Ball drawn spots, by player
  spots: Map<string, Vector3>
}

/**
 * Angle from the tee toward the cup
 * @param {GolfHole} hole - Hole
 * @return {number} - Yaw
 */

export const teeYaw = (hole: GolfHole): number =>
  Math.atan2(hole.cup[0] - hole.tee[0], hole.cup[1] - hole.tee[1])

/**
 * Camera rig at the tee of a hole
 * @param {GolfHole} hole - Hole
 * @return {GolfRig} - Rig
 */

export const createRig = (hole: GolfHole): GolfRig => ({
  yaw: teeYaw(hole),
  distance: camera.distance,
  isOverview: false,
  turn: 0,
  zoom: 0,
  target: new Vector3(hole.tee[0], 0, hole.tee[1]),
  spots: new Map(),
})

/**
 * Centre and reach of the whole hole
 * @param {GolfHole} hole - Hole
 * @return {{ center: Vector3, reach: number }} - Overview frame
 */

export const overviewOf = (hole: GolfHole): { center: Vector3; reach: number } => {
  const { x0, x1, z0, z1 } = hole.bounds

  return {
    center: new Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2),
    reach: Math.max(x1 - x0, z1 - z0),
  }
}

/**
 * Camera spot behind a target
 * @param {Vector3} target - Point looked at
 * @param {number} yaw - Look direction
 * @param {number} distance - Distance
 * @param {number} pitch - Height angle
 * @param {Vector3} out - Vector written
 * @return {Vector3} - Camera spot
 */

export const cameraSpot = (
  target: Vector3,
  yaw: number,
  distance: number,
  pitch: number,
  out: Vector3
): Vector3 =>
  out.set(
    target.x - Math.sin(yaw) * distance * Math.cos(pitch),
    target.y + distance * Math.sin(pitch),
    target.z - Math.cos(yaw) * distance * Math.cos(pitch)
  )

/**
 * Distance kept inside the zoom bounds
 * @param {number} distance - Asked distance
 * @return {number} - Bounded distance
 */

export const clampDistance = (distance: number): number =>
  Math.min(camera.maxDistance, Math.max(camera.minDistance, distance))
