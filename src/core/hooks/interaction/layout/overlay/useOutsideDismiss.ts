'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Close a floating surface on a pointer landing outside it
 * @param {boolean} active - Surface is open
 * @param {RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[]} boundary - Elements the pointer may stay inside
 * @param {() => void} onDismiss - Close handler
 * @param {string} [keep] - Selector of portaled surfaces that never dismiss
 * @return {void}
 */

export const useOutsideDismiss = (
  active: boolean,
  boundary: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onDismiss: () => void,
  keep?: string
): void => {
  useEffect(() => {
    if (!active) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element
      const bounds = Array.isArray(boundary) ? boundary : [boundary]
      if (bounds.some((ref) => ref.current?.contains(target))) return
      if (keep && target.closest?.(keep)) return

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
  }, [active, boundary, onDismiss, keep])
}
