'use client'

import { useEffect, useRef, useState } from 'react'

// Clock tick
const TICK_MS = 200

/**
 * Current time on the server clock, ticking, set again by each newer server reading
 * @param {Date | string} serverTime - Server time of the latest read
 * @return {number} - Now, in server milliseconds
 */

export const useServerNow = (serverTime: Date | string): number => {
  const read = new Date(serverTime).getTime()
  const [now, setNow] = useState(read)
  // Quickest reading kept: an old page from the router cache is put right by a fresh push
  const offset = useRef<number | null>(null)

  useEffect(() => {
    const next = read - Date.now()
    offset.current = offset.current === null ? next : Math.max(offset.current, next)
  }, [read])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (offset.current !== null) setNow(Date.now() + offset.current)
    }, TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  return now
}
