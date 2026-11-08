import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'

import { trackSpot } from '@/core/lib/play/golf'
import type { GolfMotion } from '@/core/lib/play/golf'

// Reach beyond the obstacle that wakes it, metres
const REACH = 0.3

/**
 * Obstacle unseen until a ball touches or passes close to it
 * @param {RefObject<GolfMotion>} motionRef - Ball tracks and hit pulses
 * @param {{ x0: number, x1: number, z0: number, z1: number }} zone - Obstacle footprint
 * @param {string} [id] - Bumper id, also woken by its hit pulse
 * @return {boolean} - Revealed, for good once true
 */

export const useReveal = (
  motionRef: RefObject<GolfMotion>,
  zone: { x0: number; x1: number; z0: number; z1: number },
  id?: string
): boolean => {
  const [isShown, setShown] = useState(false)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return
    const motion = motionRef.current
    const now = performance.now()
    const isHit = id !== undefined && motion.pulses.has(id)
    const isNear = [...motion.tracks.values()].some((track) => {
      const { x, z } = trackSpot(track, now)

      return (
        x > zone.x0 - REACH && x < zone.x1 + REACH && z > zone.z0 - REACH && z < zone.z1 + REACH
      )
    })
    if (!isHit && !isNear) return
    done.current = true
    setShown(true)
  })

  return isShown
}
