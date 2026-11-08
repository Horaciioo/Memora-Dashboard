import { Quaternion, Vector3 } from 'three'
import type { Mesh } from 'three'
import type { RefObject } from 'react'

import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Ground faces up
const UP = new Vector3(0, 1, 0)

// Moves past this are jumps
const JUMP = 1

/**
 * Turn a ball by the ground it covered
 * @param {Mesh} roller - Ball mesh
 * @param {RefObject<Vector3 | null>} last - Previous centre
 * @param {Vector3} now - Centre now
 * @param {number} scale - Size factor
 * @return {void}
 */

export const rollBall = (
  roller: Mesh,
  last: RefObject<Vector3 | null>,
  now: Vector3,
  scale: number
): void => {
  const before = last.current
  if (!before) {
    last.current = now.clone()
    return
  }
  const move = new Vector3(now.x - before.x, 0, now.z - before.z)
  before.copy(now)
  const distance = move.length()
  if (distance < 1e-5 || distance > JUMP) return

  // Axis across the move
  const axis = new Vector3().crossVectors(UP, move).normalize()
  const turn = new Quaternion().setFromAxisAngle(
    axis,
    distance / (GOLF_SETTINGS.physics.ballRadius * scale)
  )
  roller.quaternion.premultiply(turn)
}
