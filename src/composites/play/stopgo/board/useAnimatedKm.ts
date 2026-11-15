import { useEffect, useRef, useState } from 'react'

import { STOPGO_TRACK } from '@/declarations/play/stopgo/track'

/**
 * Distance shown, glides from the shown value to the new one and starts by itself
 * @param {number} km - Distance on the board
 * @return {number} - Distance to draw
 */

export const useAnimatedKm = (km: number) => {
  const [shown, setShown] = useState(km)
  const shownRef = useRef(km)

  useEffect(() => {
    const from = shownRef.current
    if (from === km) return

    const { perKm, minMs, maxMs } = STOPGO_TRACK.move
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = isReduced ? 0 : Math.min(maxMs, Math.max(minMs, Math.abs(km - from) * perKm))
    const began = performance.now()
    let frame = 0

    const step = (now: number) => {
      const share = duration ? Math.min((now - began) / duration, 1) : 1
      const eased = 1 - Math.pow(1 - share, 3)
      shownRef.current = from + (km - from) * eased
      setShown(shownRef.current)
      if (share < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame)
  }, [km])

  return shown
}
