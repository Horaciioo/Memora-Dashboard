'use client'

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

// Pull in pixels that lets go of the sheet
const DISMISS_DISTANCE = 96

/**
 * Pull a sheet down by its grip to close it
 * @param {() => void} onDismiss - Called once the pull is far enough
 * @return {{ offset: number, isDragging: boolean, handlers: object }} - Live offset and grip handlers
 */

export const useSheetDrag = (onDismiss: () => void) => {
  const [offset, setOffset] = useState(0)
  const [isDragging, setDragging] = useState(false)
  const startY = useRef<number | null>(null)

  const end = () => {
    const pulled = offset
    startY.current = null
    setDragging(false)
    setOffset(0)
    if (pulled > DISMISS_DISTANCE) onDismiss()
  }

  const handlers = {
    onPointerDown: (event: PointerEvent) => {
      startY.current = event.clientY
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: PointerEvent) => {
      if (startY.current === null) return

      setOffset(Math.max(0, event.clientY - startY.current))
    },
    onPointerUp: end,
    onPointerCancel: end,
  }

  return { offset, isDragging, handlers }
}
