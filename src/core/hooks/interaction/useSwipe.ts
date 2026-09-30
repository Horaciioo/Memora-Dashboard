'use client'

import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

import { GESTURE_SETTINGS } from '@/declarations/configurations/settings'

// SwipeAxis
export type SwipeAxis = 'x' | 'y'

// SwipeDirection
export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

// UseSwipeOptions
export interface UseSwipeOptions {
  // Axis the drag is
  axis: SwipeAxis
  // Fired on release once
  onSwipe: (direction: SwipeDirection) => void
  // Share of the element
  thresholdRatio?: number
  // Speed in px per
  flingVelocity?: number
  // Bounds the live offset,
  clamp?: [number, number]
  // Arms only when the
  edgeStartPx?: number
  // Pointer types the gesture
  pointerTypes?: string[]
  enabled?: boolean
}

// UseSwipeResult
export interface UseSwipeResult {
  handlers: {
    onPointerDown: (event: ReactPointerEvent) => void
    onPointerMove: (event: ReactPointerEvent) => void
    onPointerUp: (event: ReactPointerEvent) => void
    onPointerCancel: (event: ReactPointerEvent) => void
  }
  // Signed live travel in
  offset: number
  isDragging: boolean
  // touch-action locking the opposite
  axisStyle: CSSProperties
}

interface DragOrigin {
  x: number
  y: number
  size: number
  active: boolean
  lastMain: number
  lastTime: number
  velocity: number
  pointerId: number
}

const clampOffset = (value: number, bounds?: [number, number]): number => {
  if (!bounds) return value

  return Math.min(Math.max(value, bounds[0]), bounds[1])
}

/**
 * Single pointer drag primitive, every swipe of the app is built on it
 * @param {UseSwipeOptions} options - Axis, commit handler, thresholds and guards
 * @return {UseSwipeResult} - Pointer handlers, the live offset and the axis lock style
 */

export const useSwipe = ({
  axis,
  onSwipe,
  thresholdRatio = GESTURE_SETTINGS.swipeRatio,
  flingVelocity = GESTURE_SETTINGS.flingVelocity,
  clamp,
  edgeStartPx,
  pointerTypes = ['touch', 'pen'],
  enabled = true,
}: UseSwipeOptions): UseSwipeResult => {
  const origin = useRef<DragOrigin | null>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const slop = GESTURE_SETTINGS.startSlopPx

  const reset = () => {
    origin.current = null
    setOffset(0)
    setIsDragging(false)
  }

  const mainOf = (event: ReactPointerEvent): number =>
    axis === 'x' ? event.clientX : event.clientY

  const onPointerDown = (event: ReactPointerEvent) => {
    if (!enabled || !pointerTypes.includes(event.pointerType)) return

    const rect = event.currentTarget.getBoundingClientRect()
    const size = axis === 'x' ? rect.width : rect.height
    const withinEdge = axis === 'x' ? event.clientX - rect.left : event.clientY - rect.top

    if (typeof edgeStartPx === 'number' && withinEdge > edgeStartPx) return

    // The press stays a
    // so a tap on
    origin.current = {
      x: event.clientX,
      y: event.clientY,
      size: size || 1,
      active: false,
      lastMain: mainOf(event),
      lastTime: event.timeStamp,
      velocity: 0,
      pointerId: event.pointerId,
    }
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = origin.current
    if (!drag) return

    const deltaX = event.clientX - drag.x
    const deltaY = event.clientY - drag.y
    const main = axis === 'x' ? deltaX : deltaY
    const cross = axis === 'x' ? deltaY : deltaX

    if (!drag.active) {
      // A press that travels
      if (Math.abs(cross) > Math.abs(main) && Math.abs(cross) > slop) {
        origin.current = null
        return
      }

      if (Math.abs(main) < slop) return

      drag.active = true
      event.currentTarget.setPointerCapture(drag.pointerId)
      setIsDragging(true)
    }

    const now = mainOf(event)
    const dt = event.timeStamp - drag.lastTime

    if (dt > 0) drag.velocity = (now - drag.lastMain) / dt
    drag.lastMain = now
    drag.lastTime = event.timeStamp

    setOffset(clampOffset(main, clamp))
  }

  const onPointerUp = () => {
    const drag = origin.current

    if (!drag || !drag.active) {
      origin.current = null
      return
    }

    const travelled = clampOffset(drag.lastMain - (axis === 'x' ? drag.x : drag.y), clamp)
    const passedDistance = Math.abs(travelled) >= thresholdRatio * drag.size
    const passedFling = Math.abs(drag.velocity) >= flingVelocity

    if ((passedDistance || passedFling) && travelled !== 0) {
      if (axis === 'x') onSwipe(travelled > 0 ? 'right' : 'left')
      else onSwipe(travelled > 0 ? 'down' : 'up')
    }

    reset()
  }

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
    offset,
    isDragging,
    axisStyle: { touchAction: axis === 'x' ? 'pan-y' : 'pan-x' },
  }
}
