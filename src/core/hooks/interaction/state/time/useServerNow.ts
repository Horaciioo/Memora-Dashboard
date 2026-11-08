'use client'

import { useEffect, useState } from 'react'

// Clock tick
const TICK_MS = 200

/**
 * Current time on the server clock, ticking
 * @param {Date | string} serverTime - Server time when the page was read
 * @return {number} - Now, in server milliseconds
 */

export const useServerNow = (serverTime: Date | string): number => {
  const [offset] = useState(() => new Date(serverTime).getTime() - Date.now())
  const [now, setNow] = useState(() => Date.now() + offset)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now() + offset), TICK_MS)

    return () => window.clearInterval(timer)
  }, [offset])

  return now
}
