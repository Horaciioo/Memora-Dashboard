'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

// Anything reachable with the tab key
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Keep focus inside an overlay and give it back on close
 * @param {boolean} active - Trap is on
 * @param {() => void} onDismiss - Escape handler
 * @return {RefObject<HTMLDivElement | null>} - Ref of the trapped container
 */

export const useFocusTrap = (
  active: boolean,
  onDismiss: () => void
): RefObject<HTMLDivElement | null> => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    // Remember the trigger so focus goes back to it
    restoreRef.current = document.activeElement as HTMLElement | null

    const container = containerRef.current
    const first = container?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onDismiss()
        return
      }

      if (event.key !== 'Tab' || !container) return

      // Cycle within the container instead of leaving it
      const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (focusable.length === 0) return

      const edge = event.shiftKey ? focusable[0] : focusable[focusable.length - 1]
      if (document.activeElement !== edge) return

      event.preventDefault()
      ;(event.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      restoreRef.current?.focus()
    }
  }, [active, onDismiss])

  return containerRef
}
