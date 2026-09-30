'use client'

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/**
 * How far the reader has come down an element: 0 while its top is below the screen, 1 once its
 * bottom reaches the screen bottom
 * @param {RefObject<HTMLElement | null>} ref - Element read through
 * @param {unknown} reset - Changes when the element's content changes, restarting the count
 * @return {number} - Ratio between 0 and 1
 */

export const useScrollFill = (ref: RefObject<HTMLElement | null>, reset: unknown): number => {
  const [fill, setFill] = useState(0)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const node = ref.current
      if (!node) return

      const box = node.getBoundingClientRect()
      const read = Math.min(Math.max(window.innerHeight - box.top, 0), box.height)

      setFill(box.height > 0 ? read / box.height : 1)
    }

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure)
    }

    schedule()
    // Any scroller counts, the framed page may not be the window
    window.addEventListener('scroll', schedule, { passive: true, capture: true })
    window.addEventListener('resize', schedule)

    // Content growing (an exercise answered) moves the bottom
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    if (ref.current) observer?.observe(ref.current)

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule, { capture: true })
      window.removeEventListener('resize', schedule)
      observer?.disconnect()
    }
  }, [ref, reset])

  return fill
}
