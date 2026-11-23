'use client'

import { useEffect, useState } from 'react'

import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { prefersReducedMotion } from '@/utils/motion'

/**
 * Letters Memora has written so far of something that appears on screen, one at a time
 * @param {number} total - Letters in all
 * @param {number} [after] - Letters written elsewhere first, this waits for them
 * @return {number} - Letters shown
 */

export const useWritten = (total: number, after: number = 0): number => {
  const isCalm = prefersReducedMotion()
  const [count, setCount] = useState(isCalm ? total : 0)
  const step = ASSISTANT_SETTINGS.typingMsPerChar

  // The wait for what comes before is spent once, then every letter takes a step
  useEffect(() => {
    if (count >= total) return

    const timer = window.setTimeout(
      () => setCount((current) => current + 1),
      count === 0 ? after * step + step : step
    )

    return () => window.clearTimeout(timer)
  }, [count, total, after, step])

  return Math.min(count, total)
}
