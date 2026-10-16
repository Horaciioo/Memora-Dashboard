'use client'

import { useEffect, useRef, useState } from 'react'

// Refresh rate of the clock
const TICK_MS = 200

/**
 * Seconds left on a clock restarted by its key
 * @param {number | null} seconds - Length, null when untimed
 * @param {unknown} runKey - New value restarts the clock
 * @param {boolean} isRunning - Clock ticking
 * @param {() => void} [onEnd] - Called once at zero
 * @return {number | null} - Whole seconds left
 */

export const useCountdown = (
  seconds: number | null,
  runKey: unknown,
  isRunning: boolean,
  onEnd?: () => void
): number | null => {
  // Reading tagged with its run
  const [reading, setReading] = useState<{ run: unknown; left: number } | null>(null)
  const ended = useRef(onEnd)

  // Latest callback
  useEffect(() => {
    ended.current = onEnd
  }, [onEnd])

  useEffect(() => {
    if (seconds === null || !isRunning) return

    const endsAt = Date.now() + seconds * 1000
    const timer = setInterval(() => {
      const remaining = Math.max(0, endsAt - Date.now())
      setReading({ run: runKey, left: Math.ceil(remaining / 1000) })

      if (remaining === 0) {
        clearInterval(timer)
        ended.current?.()
      }
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [seconds, runKey, isRunning])

  if (seconds === null) return null

  // A stale reading belongs to the previous run
  return isRunning && reading && reading.run === runKey ? reading.left : seconds
}
