'use client'

import { useEffect } from 'react'

// Shared between every open overlay
let freezeCount = 0

/**
 * Freeze page scroll while active
 * @param {boolean} active - Lock is on
 * @return {void} - Nothing
 */

export const useScrollLock = (active: boolean): void => {
  useEffect(() => {
    if (!active) return

    // First overlay stores and replaces the value
    if (freezeCount === 0) document.body.style.overflow = 'hidden'
    freezeCount += 1

    return () => {
      freezeCount -= 1
      if (freezeCount === 0) document.body.style.overflow = ''
    }
  }, [active])
}
