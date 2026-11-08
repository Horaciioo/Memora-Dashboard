'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TouchEvent } from 'react'

// Swipe distance in pixels
const SWIPE_PX = 40

/**
 * Followed ball of a spectator
 * @typedef {Object} GolfWatch
 * @property {string} focusId - Followed player
 * @property {function} select - Follow one
 * @property {function} step - Next or previous
 * @property {function} onTouchStart - Swipe start
 * @property {function} onTouchEnd - Swipe end
 */

export interface GolfWatch {
  focusId: string
  select: (id: string) => void
  step: (direction: 1 | -1) => void
  onTouchStart: (event: TouchEvent) => void
  onTouchEnd: (event: TouchEvent) => void
}

/**
 * Pick a player by arrows, keys or swipe
 * @param {string[]} ids - Followable players
 * @param {string} fallbackId - Default player
 * @param {boolean} isEnabled - Spectating
 * @return {GolfWatch} - Followed ball and gestures
 */

export const useGolfWatch = (ids: string[], fallbackId: string, isEnabled: boolean): GolfWatch => {
  const [picked, setPicked] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  // Picked player may have left
  const focusId = picked && ids.includes(picked) ? picked : fallbackId

  const step = useCallback(
    (direction: 1 | -1) => {
      if (ids.length === 0) return
      const index = ids.indexOf(focusId)
      setPicked(ids[(index + direction + ids.length) % ids.length])
    },
    [ids, focusId]
  )

  // Arrow keys
  useEffect(() => {
    if (!isEnabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') step(-1)
      if (event.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isEnabled, step])

  return {
    focusId,
    select: setPicked,
    step,
    onTouchStart: (event) => setStartX(event.touches[0].clientX),
    onTouchEnd: (event) => {
      const delta = event.changedTouches[0].clientX - startX
      if (Math.abs(delta) >= SWIPE_PX) step(delta < 0 ? 1 : -1)
    },
  }
}
