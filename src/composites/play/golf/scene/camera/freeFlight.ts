import { Vector3 } from 'three'
import type { Camera } from 'three'

import { cameraSpot, clampFree, flatAxes } from '@/composites/play/golf/scene/camera/rig'
import type { GolfRig } from '@/composites/play/golf/scene/camera/rig'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { freeCamera } = GOLF_SETTINGS

// Reused each frame
const wanted = new Vector3()
const look = new Vector3()
const follow = new Vector3()

/**
 * One frame of the free flight: held keys push, the box holds, the view blends in or out
 * @param {GolfRig} rig - Shared rig
 * @param {Camera} view - Camera
 * @param {number} delta - Seconds
 * @param {{ distance: number, pitch: number }} framing - Follow framing of this frame
 * @return {boolean} - Camera placed by the flight
 */

export const flyFree = (
  rig: GolfRig,
  view: Camera,
  delta: number,
  framing: { distance: number; pitch: number }
): boolean => {
  const { free } = rig
  // Takes off from where the view stands
  if (rig.isFree && free.mix === 0) free.position.copy(view.position)
  const goal = rig.isFree ? 1 : 0
  free.mix += (goal - free.mix) * Math.min(1, delta * freeCamera.blend)
  if (!rig.isFree && free.mix < 0.01) {
    free.mix = 0
    return false
  }

  const { ahead, right } = flatAxes(rig.yaw)
  wanted.set(
    (ahead[0] * free.move.z + right[0] * free.move.x) * free.speed,
    free.move.y * free.speed,
    (ahead[1] * free.move.z + right[1] * free.move.x) * free.speed
  )
  free.velocity.lerp(wanted, Math.min(1, delta * freeCamera.accel))
  if (rig.isFree) clampFree(free.position.addScaledVector(free.velocity, delta), free.box)

  // Same look as the follow view, so the switch never jumps
  look.set(
    Math.sin(rig.yaw) * Math.cos(rig.pitch),
    -Math.sin(rig.pitch),
    Math.cos(rig.yaw) * Math.cos(rig.pitch)
  )
  cameraSpot(rig.target, rig.yaw, framing.distance, framing.pitch, follow)
  view.position.lerpVectors(follow, free.position, free.mix)
  view.lookAt(look.add(view.position))

  return true
}
