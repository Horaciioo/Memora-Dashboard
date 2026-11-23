'use client'

import { useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'

import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'

// Room kept under the box
const BOTTOM_GAP = 16

/**
 * Height that ends a box at the bottom of the window
 * @param {RefObject<HTMLElement | null>} ref - Box measured
 * @param {boolean} isActive - Fits only when asked
 * @return {number | null} - Pixels, null while unknown
 */

export const useFitHeight = (ref: RefObject<HTMLElement | null>, isActive: boolean) => {
  const [height, setHeight] = useState<number | null>(null)
  const isMobile = useIsMobileShell()

  useLayoutEffect(() => {
    const box = ref.current
    if (!isActive || isMobile || !box) {
      setHeight(null)

      return
    }

    // Top of the box in the page, then what is left under it
    const fit = () => {
      const top = box.getBoundingClientRect().top + window.scrollY
      setHeight(Math.max(240, window.innerHeight - top - BOTTOM_GAP))
    }
    fit()
    window.addEventListener('resize', fit)

    return () => window.removeEventListener('resize', fit)
  }, [ref, isActive, isMobile])

  return height
}
