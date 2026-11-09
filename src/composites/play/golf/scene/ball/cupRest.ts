import type { RefObject } from 'react'
import { Vector3 } from 'three'
import type { Group, Mesh } from 'three'

import { rollBall } from '@/composites/play/golf/scene/ball/roll'
import { cupNear } from '@/core/lib/play/golf'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { physics } = GOLF_SETTINGS
const { stack } = GOLF_SCENE

/**
 * Resting spot of a holed ball inside the cup, one per arrival order
 * @param {number} seat - Order it fell in
 * @return {[number, number, number]} - Offset from the cup centre
 */

const stackSpot = (seat: number): [number, number, number] => {
  const angle = seat * 2.4
  const radius = Math.min(seat, 3) * stack.jitter
  return [Math.cos(angle) * radius, seat * stack.gap, Math.sin(angle) * radius]
}

/**
 * Places a holed ball at its stacked resting spot, popping it away once free
 * @param {Object} args - Ball refs and timing
 * @return {void}
 */

export const applyCupRest = ({
  body,
  roller,
  shield,
  last,
  restedAt,
  spots,
  id,
  hole,
  at,
  seat,
  isWaiting,
  hasLeft,
  now,
}: {
  body: Group
  roller: Mesh | null
  shield: Mesh | null
  last: RefObject<Vector3 | null>
  restedAt: RefObject<number | null>
  spots: Map<string, Vector3>
  id: string
  hole: GolfHole
  // Where the ball sleeps, picks the cup
  at: { x: number; z: number }
  seat: number
  isWaiting: boolean
  hasLeft: boolean
  now: number
}): void => {
  restedAt.current ??= now
  const spot = cupNear(hole, at.x, at.z)
  const cupFloor = spot.floor
  const [ox, oy, oz] = stackSpot(seat)
  const since = isWaiting ? 0 : now - restedAt.current
  const pop = Math.min(1, since / stack.popMs)
  body.position.set(
    spot.x + ox,
    cupFloor -
      GOLF_SETTINGS.cup.depth +
      physics.ballRadius +
      oy +
      pop * GOLF_SETTINGS.cup.depth * 2,
    spot.z + oz
  )
  body.scale.setScalar(Math.max(1 - pop, 1e-3))
  body.visible = !hasLeft && pop < 1
  if (shield) shield.visible = false
  if (roller) rollBall(roller, last, body.position, 1)
  spots.set(id, (spots.get(id) ?? new Vector3()).copy(body.position))
}
