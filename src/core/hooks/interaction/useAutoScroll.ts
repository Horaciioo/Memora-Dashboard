'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { prefersReducedMotion } from '@/utils/motion'

// Frame gap past which a slept tab does not make the strip jump
const MAX_FRAME_MS = 64

// Distance under which a scroll position counts as the one the hook wrote
const OWN_SCROLL_SLOP_PX = 2

// AutoScrollOptions
export interface AutoScrollOptions {
  // Speed of the drift
  speedPxPerSecond: number
  // Wait after a hand scroll before the drift resumes
  resumeDelayMs: number
  // Off, the strip stays a plain scroller
  isActive: boolean
}

/**
 * Drifts a strip slowly to the left in an endless loop. The strip holds two identical groups,
 * the drift wraps once the first has gone by. A pointer over it, a finger on it or a focused
 * child holds it, and it picks up again after the last hand scroll. Never runs under
 * reduced motion or while the strip is off screen
 * @param {AutoScrollOptions} options - Speed, resume delay and switch
 * @return {RefObject<HTMLDivElement | null>} - Ref of the strip
 */

export const useAutoScroll = ({
  speedPxPerSecond,
  resumeDelayMs,
  isActive,
}: AutoScrollOptions): RefObject<HTMLDivElement | null> => {
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const strip = stripRef.current

    if (!strip || !isActive) return undefined
    if (prefersReducedMotion()) return undefined

    // Float position, a scroller rounds what it is given
    let position = strip.scrollLeft
    let resumeAt = 0
    let last = performance.now()
    let frame = 0
    let isVisible = true
    let isHovered = false
    let isTouched = false
    let isFocused = false

    // Distance between the two groups
    const loopWidth = (): number => {
      const first = strip.children[0]
      const second = strip.children[1]

      return first instanceof HTMLElement && second instanceof HTMLElement
        ? second.offsetLeft - first.offsetLeft
        : 0
    }

    const pauseForAWhile = () => {
      resumeAt = performance.now() + resumeDelayMs
    }

    const tick = (now: number) => {
      const elapsed = Math.min(now - last, MAX_FRAME_MS)
      const loop = loopWidth()
      const isHeld = isHovered || isTouched || isFocused || now < resumeAt

      last = now

      // Nothing to loop over when the groups fit
      if (isVisible && !isHeld && loop > strip.clientWidth) {
        position = (position + (speedPxPerSecond * elapsed) / 1000) % loop
        strip.scrollLeft = position
      }

      frame = requestAnimationFrame(tick)
    }

    // A hand scroll takes over, past the loop it wraps as well
    const onScroll = () => {
      const loop = loopWidth()

      if (loop > 0 && strip.scrollLeft >= loop + OWN_SCROLL_SLOP_PX) strip.scrollLeft -= loop

      if (Math.abs(strip.scrollLeft - position) > OWN_SCROLL_SLOP_PX) {
        position = strip.scrollLeft
        pauseForAWhile()
      }
    }

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') isHovered = true
    }

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') isHovered = false
    }

    const holdByTouch = () => {
      isTouched = true
    }

    // Momentum keeps scrolling after the finger lifts
    const releaseTouch = () => {
      isTouched = false
      pauseForAWhile()
    }

    const onFocusIn = () => {
      isFocused = true
    }

    const onFocusOut = () => {
      isFocused = false
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true
    })

    observer.observe(strip)
    strip.addEventListener('scroll', onScroll, { passive: true })
    strip.addEventListener('wheel', pauseForAWhile, { passive: true })
    strip.addEventListener('pointerenter', onPointerEnter)
    strip.addEventListener('pointerleave', onPointerLeave)
    strip.addEventListener('touchstart', holdByTouch, { passive: true })
    strip.addEventListener('touchend', releaseTouch)
    strip.addEventListener('touchcancel', releaseTouch)
    strip.addEventListener('focusin', onFocusIn)
    strip.addEventListener('focusout', onFocusOut)

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      strip.removeEventListener('scroll', onScroll)
      strip.removeEventListener('wheel', pauseForAWhile)
      strip.removeEventListener('pointerenter', onPointerEnter)
      strip.removeEventListener('pointerleave', onPointerLeave)
      strip.removeEventListener('touchstart', holdByTouch)
      strip.removeEventListener('touchend', releaseTouch)
      strip.removeEventListener('touchcancel', releaseTouch)
      strip.removeEventListener('focusin', onFocusIn)
      strip.removeEventListener('focusout', onFocusOut)
    }
  }, [speedPxPerSecond, resumeDelayMs, isActive])

  return stripRef
}
