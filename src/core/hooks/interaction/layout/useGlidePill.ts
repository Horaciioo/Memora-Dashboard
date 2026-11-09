'use client'

import { useLayoutEffect, useRef } from 'react'

import { glideDurationMs, prefersReducedMotion } from '@/utils/motion'

interface Box {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Pill gliding behind the open item of a strip, in both directions
 * @param {string} value - Open item key
 * @param {string} [layout] - Changes when the items move
 * @return {Object} - Refs for the strip, its items and the pill
 */

export const useGlidePill = (value: string, layout = '') => {
  const itemsRef = useRef(new Map<string, HTMLElement>())
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const lastRef = useRef<Box | null>(null)

  useLayoutEffect(() => {
    const pill = pillRef.current
    const item = itemsRef.current.get(value)
    if (!pill || !item) return

    // Written on the node
    const place = (box: Box, duration: number) => {
      pill.style.transition =
        duration > 0
          ? ['transform', 'width', 'height']
              .map((name) => `${name} ${duration}ms var(--motion-ease-glide)`)
              .join(', ')
          : 'none'
      pill.style.width = `${box.width}px`
      pill.style.height = `${box.height}px`
      pill.style.transform = `translate(${box.x}px, ${box.y}px)`
    }

    const end = {
      x: item.offsetLeft,
      y: item.offsetTop,
      width: item.offsetWidth,
      height: item.offsetHeight,
    }
    const from = lastRef.current

    if (!from || prefersReducedMotion()) place(end, 0)
    else {
      // Start where the pill stood, then move once that is painted
      place(from, 0)
      void pill.offsetWidth
      place(end, glideDurationMs())
    }
    lastRef.current = end
  }, [value, layout])

  return { itemsRef, pillRef }
}
