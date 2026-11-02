'use client'

import { useEffect, useState } from 'react'

// Clock tick
const TICK_MS = 15_000

/**
 * Current time in ms
 * @return {number} - Now, refreshed every few seconds
 */

export const useClock = (): number => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  return now
}
