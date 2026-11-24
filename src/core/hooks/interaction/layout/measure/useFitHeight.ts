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
 * @param {boolean} isBleeding - Reaches the top of the page too
 * @return {{ height: number, bleed: number } | null} - Pixels, null while unknown
 */

export const useFitHeight = (
  ref: RefObject<HTMLElement | null>,
  isActive: boolean,
  isBleeding = false
) => {
  const [fit, setFit] = useState<{ height: number; bleed: number } | null>(null)
  const isMobile = useIsMobileShell()

  useLayoutEffect(() => {
    const box = ref.current
    if (!isActive || isMobile || !box) {
      setFit(null)

      return
    }

    // Top of the box in the page, then what is left under it
    const measure = () => {
      const top = box.getBoundingClientRect().top + window.scrollY
      const bleed = isBleeding ? Math.round(top) : 0
      setFit({ height: Math.max(240, window.innerHeight - top - BOTTOM_GAP + bleed), bleed })
    }
    measure()
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [ref, isActive, isMobile, isBleeding])

  return fit
}
