import { Vector3 } from 'three'

import type { GolfStage } from '@/composites/play/golf/scene/stage'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { camera, freeCamera } = GOLF_SETTINGS

/**
 * Free flight state of the camera
 * @typedef {Object} GolfFreeFlight
 */

export interface GolfFreeFlight {
  position: Vector3
  velocity: Vector3
  // Held keys: x sideways, y up, z ahead
  move: Vector3
  speed: number
  // Share of the free view, eased both ways
  mix: number
  // Flight box, map wide
  box: GolfFreeBox
}

/**
 * Box the free camera stays in
 * @typedef {Object} GolfFreeBox
 */

export interface GolfFreeBox {
  x0: number
  x1: number
  z0: number
  z1: number
  minY: number
  maxY: number
}

/**
 * Camera and ball spots shared inside the canvas
 * @typedef {Object} GolfRig
 */

export interface GolfRig {
  // Look direction, zero toward +z
  yaw: number
  distance: number
  // Height angle above the ground
  pitch: number
  isOverview: boolean
  // Held keys, turn and zoom
  turn: number
  zoom: number
  // Held keys, climb
  climb: number
  // Smoothed point looked at
  target: Vector3
  // Ball drawn spots, by player
  spots: Map<string, Vector3>
  // Follow a ball, or fly anywhere
  isFree: boolean
  free: GolfFreeFlight
  // End of hole sequence, balls flying to the next tee
  stage: GolfStage | null
  // Framing forced by the sequence, eased like the overview
  pin: { center: Vector3; reach: number } | null
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
  pitch: camera.pitch,
  isOverview: false,
  turn: 0,
  zoom: 0,
  climb: 0,
  target: new Vector3(hole.tee[0], 0, hole.tee[1]),
  spots: new Map(),
  isFree: false,
  free: {
    position: new Vector3(),
    velocity: new Vector3(),
    move: new Vector3(),
    speed: freeCamera.speed,
    mix: 0,
    box: freeBox([hole.bounds]),
  },
  stage: null,
  pin: null,
})

/**
 * Flight box over every hole of the map, with a margin
 * @param {GolfHole['bounds'][]} rects - Holes, around the played one
 * @return {GolfFreeBox} - Box
 */

export const freeBox = (rects: GolfHole['bounds'][]): GolfFreeBox => ({
  x0: Math.min(...rects.map((rect) => rect.x0)) - freeCamera.margin,
  x1: Math.max(...rects.map((rect) => rect.x1)) + freeCamera.margin,
  z0: Math.min(...rects.map((rect) => rect.z0)) - freeCamera.margin,
  z1: Math.max(...rects.map((rect) => rect.z1)) + freeCamera.margin,
  minY: freeCamera.minHeight,
  maxY: freeCamera.maxHeight,
})

/**
 * Spot brought back inside the flight box
 * @param {Vector3} position - Spot, written in place
 * @param {GolfFreeBox} box - Box
 * @return {Vector3} - Same spot
 */

export const clampFree = (position: Vector3, box: GolfFreeBox): Vector3 =>
  position.set(
    Math.min(box.x1, Math.max(box.x0, position.x)),
    Math.min(box.maxY, Math.max(box.minY, position.y)),
    Math.min(box.z1, Math.max(box.z0, position.z))
  )

/**
 * Flight speed kept inside its bounds
 * @param {number} speed - Asked speed
 * @return {number} - Bounded speed
 */

export const clampFreeSpeed = (speed: number): number =>
  Math.min(freeCamera.maxSpeed, Math.max(freeCamera.minSpeed, speed))

/**
 * Ahead and right of a yaw, flat on the ground
 * @param {number} yaw - Look direction
 * @return {{ ahead: [number, number], right: [number, number] }} - Unit x z
 */

export const flatAxes = (yaw: number): { ahead: [number, number]; right: [number, number] } => ({
  ahead: [Math.sin(yaw), Math.cos(yaw)],
  right: [-Math.cos(yaw), Math.sin(yaw)],
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

/**
 * Height angle kept above the ground and below the zenith
 * @param {number} pitch - Asked angle
 * @return {number} - Bounded angle
 */

export const clampPitch = (pitch: number): number =>
  Math.min(camera.maxPitch, Math.max(camera.minPitch, pitch))
