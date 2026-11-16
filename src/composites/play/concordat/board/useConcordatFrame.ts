'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { CONCORDAT_ART } from '@/declarations/play/concordat/art'

// Draws one frame, true while something keeps moving
export type ConcordatDraw = (now: number) => boolean

const FRAME_MS = 1000 / CONCORDAT_ART.fps

/**
 * Redraw on request only: a frame runs when asked, and again while a draw says it moves
 * @param {RefObject<ConcordatDraw>} draw - Latest draw
 * @return {() => void} - Request a frame
 */

export const useConcordatFrame = (draw: RefObject<ConcordatDraw>): (() => void) => {
  const handle = useRef(0)
  const last = useRef(0)
  const isDirty = useRef(false)

  // Strict mode remounts: a cancelled frame must not stay pending
  useEffect(
    () => () => {
      window.cancelAnimationFrame(handle.current)
      handle.current = 0
    },
    []
  )

  return useCallback(() => {
    isDirty.current = true
    if (handle.current) return

    const tick = (now: number) => {
      handle.current = 0
      // A moving scene is capped, a request is drawn at once
      if (!isDirty.current && now - last.current < FRAME_MS) {
        handle.current = window.requestAnimationFrame(tick)

        return
      }
      isDirty.current = false
      last.current = now
      if (draw.current(now)) handle.current = window.requestAnimationFrame(tick)
    }
    handle.current = window.requestAnimationFrame(tick)
  }, [draw])
}
