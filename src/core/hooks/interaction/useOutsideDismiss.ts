'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Close a floating surface on a pointer landing outside it, or on escape
 * @param {boolean} active - Surface is open
 * @param {RefObject<HTMLElement | null>} boundary - Element the pointer may stay inside
 * @param {() => void} onDismiss - Close handler
 * @return {void}
 */

export const useOutsideDismiss = (
  active: boolean,
  boundary: RefObject<HTMLElement | null>,
  onDismiss: () => void
): void => {
  useEffect(() => {
    if (!active) return

    const onPointerDown = (event: PointerEvent) => {
      if (boundary.current?.contains(event.target as Node)) return

      onDismiss()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active, boundary, onDismiss])
}
