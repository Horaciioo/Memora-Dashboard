'use client'

import { useCallback } from 'react'
import type { RefCallback } from 'react'

import { GESTURE_SETTINGS } from '@/declarations/configurations/settings'
import { prefersReducedMotion } from '@/utils/motion'

/**
 * Lean an element a few degrees toward the mouse, written on the node so no render runs. Touch
 * and calm mode leave it flat
 * @return {RefCallback<HTMLElement>} - Ref of the element that leans
 */

export const useTilt = (): RefCallback<HTMLElement> =>
  useCallback((node: HTMLElement | null) => {
    if (!node) return

    const lean = (x: number, y: number) => {
      const max = GESTURE_SETTINGS.tiltDegrees
      node.style.transform = `perspective(${GESTURE_SETTINGS.tiltPerspectivePx}px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || prefersReducedMotion()) return

      const box = node.getBoundingClientRect()
      // Pointer position from -1 to 1 around the centre
      lean(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        ((event.clientY - box.top) / box.height) * 2 - 1
      )
    }
    const onLeave = () => lean(0, 0)

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)

    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
    }
  }, [])
