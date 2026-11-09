'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'

import { MEDIA } from '@/declarations/ui/responsive'

/**
 * Top and height of a box on screen, for a fixed column standing beside it
 * @param {RefObject<HTMLElement | null>} box - Box followed
 * @param {boolean} isActive - Followed now
 * @return {CSSProperties | undefined} - Fixed column placement, none on narrow screens
 */

export const useBoxSpan = (
  box: RefObject<HTMLElement | null>,
  isActive: boolean
): CSSProperties | undefined => {
  const [span, setSpan] = useState<CSSProperties>()

  useEffect(() => {
    const node = box.current
    if (!isActive || !node) return
    const wide = window.matchMedia(MEDIA.lg)
    const place = () => {
      if (!wide.matches) return setSpan(undefined)
      const rect = node.getBoundingClientRect()
      setSpan({ top: rect.top, height: rect.height, bottom: 'auto' })
    }
    const observer = new ResizeObserver(place)
    observer.observe(node)
    window.addEventListener('scroll', place, { passive: true, capture: true })
    // Observing reads it once at once
    window.addEventListener('resize', place)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', place, { capture: true })
      window.removeEventListener('resize', place)
    }
  }, [box, isActive])

  return isActive ? span : undefined
}
