'use client'

import { useEffect, useState } from 'react'

/**
 * Server clock read again only when one of the given moments comes
 * @param {(number | null)[]} moments - Server ms to wake at
 * @param {number} offset - Server minus local ms
 * @param {number} since - Local ms the data was read
 * @return {number} - Server ms of the last wake
 */

export const useServerAlarm = (
  moments: (number | null)[],
  offset: number,
  since: number
): number => {
  const [woke, setWoke] = useState(since)

  useEffect(() => {
    // Next moment not reached by the clock given, even if a timer fired a hair early
    const shown = Math.max(woke, since) + offset
    const next = moments
      .filter((at): at is number => at !== null && at > shown)
      .sort((left, right) => left - right)[0]
    if (next === undefined) return
    const delay = Math.max(0, next - (Date.now() + offset) + 1)
    const timer = window.setTimeout(() => setWoke(Date.now()), delay)

    return () => window.clearTimeout(timer)
  })

  return Math.max(woke, since) + offset
}
