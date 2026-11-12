'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import { fitRect, readStoredRect, resizeRect } from '@/core/lib/nexus/terminal/geometry'
import type { Bounds, Grip, Rect } from '@/core/lib/nexus/terminal/geometry'

/**
 * Window handles
 * @typedef {Object} FloatingWindowState
 * @property {Rect} rect - Current rectangle
 * @property {(event: ReactPointerEvent) => void} startMove - Header drag
 * @property {(grip: Grip) => (event: ReactPointerEvent) => void} startResize - Grip drag
 */

export interface FloatingWindowState {
  rect: Rect
  startMove: (event: ReactPointerEvent) => void
  startResize: (grip: Grip) => (event: ReactPointerEvent) => void
}

// Browser window
const viewport = () => ({ width: window.innerWidth, height: window.innerHeight })

// Stored read, storage may be blocked
const readStored = (key: string): Rect | null => {
  try {
    return readStoredRect(window.localStorage.getItem(key))
  } catch {
    return null
  }
}

/**
 * Movable and resizable window
 * @param {string} storageKey - Where the rectangle is kept
 * @param {Rect} initial - First rectangle
 * @param {Bounds} bounds - Size limits
 * @return {FloatingWindowState} - Rectangle and handles
 */

export const useFloatingWindow = (
  storageKey: string,
  initial: Rect,
  bounds: Bounds
): FloatingWindowState => {
  // Browser only, the window loads after a click
  const [rect, setRect] = useState<Rect>(() =>
    fitRect(readStored(storageKey) ?? initial, viewport(), bounds)
  )
  const rectRef = useRef(rect)

  // Latest rectangle for the drag handlers
  useEffect(() => {
    rectRef.current = rect
  }, [rect])

  // Keep inside when the browser shrinks
  useEffect(() => {
    const onResize = () => setRect((current) => fitRect(current, viewport(), bounds))
    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [bounds])

  const save = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(rectRef.current))
    } catch {
      // Storage is a comfort only
    }
  }, [storageKey])

  // One pointer drag, whatever it changes
  const drag = useCallback(
    (event: ReactPointerEvent, change: (start: Rect, dx: number, dy: number) => Rect) => {
      event.preventDefault()
      const start = rectRef.current
      const originX = event.clientX
      const originY = event.clientY

      const onMove = (move: PointerEvent) =>
        setRect(
          fitRect(change(start, move.clientX - originX, move.clientY - originY), viewport(), bounds)
        )
      const onEnd = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onEnd)
        window.removeEventListener('pointercancel', onEnd)
        save()
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onEnd)
      window.addEventListener('pointercancel', onEnd)
    },
    [bounds, save]
  )

  const startMove = useCallback(
    (event: ReactPointerEvent) => {
      // Buttons in the header keep their click
      if ((event.target as HTMLElement).closest('button')) return
      drag(event, (start, dx, dy) => ({ ...start, x: start.x + dx, y: start.y + dy }))
    },
    [drag]
  )

  const startResize = useCallback(
    (grip: Grip) => (event: ReactPointerEvent) =>
      drag(event, (start, dx, dy) => resizeRect(start, grip, dx, dy)),
    [drag]
  )

  return { rect, startMove, startResize }
}
