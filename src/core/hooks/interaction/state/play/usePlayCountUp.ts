'use client'

import { useEffect, useState } from 'react'

// Reduced motion shows the figure at once
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Figure counting up from zero once a delay has passed
 * @param {number} target - Final figure
 * @param {number} delayMs - Wait before counting
 * @param {number} durationMs - Time to reach the target
 * @return {number} - Figure shown now
 */

export const usePlayCountUp = (target: number, delayMs: number, durationMs: number): number => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) {
      const instant = window.setTimeout(() => setValue(target), 0)

      return () => window.clearTimeout(instant)
    }
    let frame = 0
    const start = window.setTimeout(() => {
      const from = performance.now()
      const tick = (now: number) => {
        const share = Math.min(1, (now - from) / durationMs)
        // Ease out, fast first then settling
        setValue(Math.round(target * (1 - (1 - share) ** 3)))
        if (share < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, delayMs)

    return () => {
      window.clearTimeout(start)
      cancelAnimationFrame(frame)
    }
  }, [target, delayMs, durationMs])

  return value
}
