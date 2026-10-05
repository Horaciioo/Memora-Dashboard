'use client'

import { useEffect, useRef } from 'react'

export interface SlideAdvanceOptions {
  // Listening at all
  enabled: boolean
  canNext: boolean
  canPrevious: boolean
  onNext: () => void
  onPrevious: () => void
}

// Wheel distance that counts as a deliberate slide
const SLIDE_THRESHOLD = 140
// Pause after a slide so one gesture moves one step
const SLIDE_COOLDOWN_MS = 800
// Finger travel that counts as a slide
const TOUCH_THRESHOLD = 90

// Page edge reached
const atBottom = () =>
  window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
const atTop = () => window.scrollY <= 0

/**
 * Whether an element under the pointer still scrolls that way
 * @param {EventTarget | null} target - Element hit
 * @param {number} direction - Positive going down
 * @return {boolean} - Inner scroller takes the gesture
 */

const innerScrolls = (target: EventTarget | null, direction: number): boolean => {
  let node = target instanceof HTMLElement ? target : null

  while (node && node !== document.body) {
    const overflow = getComputedStyle(node).overflowY

    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) {
      const room =
        direction > 0
          ? node.scrollTop + node.clientHeight < node.scrollHeight - 2
          : node.scrollTop > 0
      if (room) return true
    }

    node = node.parentElement
  }

  return false
}

/**
 * Slide past the page edge to move to the next or the previous step
 * @param {SlideAdvanceOptions} options - Step limits and handlers
 * @return {void}
 */

export const useSlideAdvance = (options: SlideAdvanceOptions): void => {
  const latest = useRef(options)

  useEffect(() => {
    latest.current = options
  })

  const { enabled } = options

  useEffect(() => {
    if (!enabled) return

    let travelled = 0
    let lockedUntil = 0
    let touchStart = 0

    // One slide per gesture
    const slide = (direction: number) => {
      const now = performance.now()
      if (now < lockedUntil) return

      const { canNext, canPrevious, onNext, onPrevious } = latest.current

      if (direction > 0 && canNext && atBottom()) onNext()
      else if (direction < 0 && canPrevious && atTop()) onPrevious()
      else return

      travelled = 0
      lockedUntil = now + SLIDE_COOLDOWN_MS
    }

    const onWheel = (event: WheelEvent) => {
      if (innerScrolls(event.target, event.deltaY)) return

      // Direction change restarts the count
      if (Math.sign(event.deltaY) !== Math.sign(travelled)) travelled = 0
      travelled += event.deltaY

      if (Math.abs(travelled) >= SLIDE_THRESHOLD) slide(Math.sign(travelled))
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStart = event.touches[0]?.clientY ?? 0
    }

    const onTouchEnd = (event: TouchEvent) => {
      const distance = touchStart - (event.changedTouches[0]?.clientY ?? touchStart)
      if (Math.abs(distance) >= TOUCH_THRESHOLD && !innerScrolls(event.target, distance)) {
        slide(Math.sign(distance))
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled])
}
