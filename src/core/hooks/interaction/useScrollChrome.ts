'use client'

import { useEffect, useState } from 'react'

import { GESTURE_SETTINGS } from '@/declarations/configurations/settings'

// ScrollChrome
export interface ScrollChrome {
  // Scrolled far enough to need a plate
  isSolid: boolean
  // Scrolling down, out of the way
  isHidden: boolean
}

const solidAfterPx = GESTURE_SETTINGS.barSolidAfterPx
const hideAfterPx = GESTURE_SETTINGS.barHideAfterPx
const directionDeltaPx = GESTURE_SETTINGS.barDirectionDeltaPx

/**
 * Scroll state of a bar laid over a banner
 * @return {ScrollChrome} - Plate and hidden flags
 */

export const useScrollChrome = (): ScrollChrome => {
  const [chrome, setChrome] = useState<ScrollChrome>({ isSolid: false, isHidden: false })

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0

    const read = () => {
      frame = 0

      const y = Math.max(window.scrollY, 0)
      const delta = y - lastY
      const isSolid = y > solidAfterPx

      // A direction needs some travel
      const isMoving = Math.abs(delta) >= directionDeltaPx
      if (isMoving) lastY = y

      setChrome((current) => {
        const isHidden = y <= hideAfterPx ? false : isMoving ? delta > 0 : current.isHidden

        return current.isSolid === isSolid && current.isHidden === isHidden
          ? current
          : { isSolid, isHidden }
      })
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return chrome
}
