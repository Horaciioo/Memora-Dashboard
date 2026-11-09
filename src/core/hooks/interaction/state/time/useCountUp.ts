'use client'

import { useEffect, useRef, useState } from 'react'

import { GESTURE_SETTINGS } from '@/declarations/configurations/settings'
import { prefersReducedMotion } from '@/utils/motion'

/**
 * Counts a number up from zero to its target
 * @param {number} target - Value the count settles on
 * @return {number} - Value to render now
 */

export const useCountUp = (target: number): number => {
  const [value, setValue] = useState(target)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) {
      setValue(target)
      return
    }

    hasRun.current = true

    const calm = prefersReducedMotion()

    if (calm || target <= 0) {
      setValue(target)
      return
    }

    const durationMs = GESTURE_SETTINGS.countUpMs
    const start = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(Math.round(target * eased))

      if (progress < 1) frame = requestAnimationFrame(step)
    })

    setValue(0)

    return () => cancelAnimationFrame(frame)
  }, [target])

  return value
}
