'use client'

import { useEffect, useState } from 'react'

// Clock tick
const TICK_MS = 15_000

/**
 * Current time in ms
 * @param {number} [tickMs] - Refresh period
 * @return {number} - Now, refreshed every few seconds
 */

export const useClock = (tickMs: number = TICK_MS): number => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), tickMs)

    return () => window.clearInterval(timer)
  }, [tickMs])

  return now
}
