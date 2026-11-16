import { useRef } from 'react'
import type { PointerEvent } from 'react'

// Travel in px that counts as a slide
const SLIDE_PX = 18

/**
 * Fold key that also slides, down to fold, up to unfold
 * @param {boolean} isFolded - Hand folded
 * @param {() => void} flip - Fold or unfold
 * @return {object} - Pointer handlers for the key
 */

export const useFoldSlide = (isFolded: boolean, flip: () => void) => {
  const startY = useRef<number | null>(null)
  const isSlid = useRef(false)

  return {
    down: (event: PointerEvent<HTMLButtonElement>) => {
      startY.current = event.clientY
      isSlid.current = false
    },
    up: (event: PointerEvent<HTMLButtonElement>) => {
      const from = startY.current
      startY.current = null
      if (from === null) return
      const delta = event.clientY - from
      if (Math.abs(delta) < SLIDE_PX) return
      isSlid.current = true
      if (delta > 0 !== isFolded) flip()
    },
    cancel: () => {
      startY.current = null
    },
    click: () => {
      if (isSlid.current) isSlid.current = false
      else flip()
    },
  }
}
