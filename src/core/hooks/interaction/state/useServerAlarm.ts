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
    // Next moment still ahead
    const now = Date.now() + offset
    const next = moments
      .filter((at): at is number => at !== null && at > now)
      .sort((left, right) => left - right)[0]
    if (next === undefined) return
    const timer = window.setTimeout(() => setWoke(Date.now()), next - now + 1)

    return () => window.clearTimeout(timer)
  })

  return Math.max(woke, since) + offset
}
