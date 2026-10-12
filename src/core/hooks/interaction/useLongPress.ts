'use client'

import { useEffect } from 'react'
import { LONG_PRESS } from '@/declarations/ui/responsive'

// Targets that keep the native hold (caret, selection)
const NATIVE_HOLD = 'input, textarea, select, [contenteditable="true"]'

/**
 * Turn a hold on a touch screen into the right click the page already answers
 * @return {void}
 */

export const useLongPress = (): void => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let origin = { x: 0, y: 0 }
    let fired = false

    const cancel = () => clearTimeout(timer)

    const onStart = (event: TouchEvent) => {
      cancel()
      fired = false

      const touch = event.touches[0]
      const target = event.target as Element | null
      if (event.touches.length !== 1 || !target || target.closest(NATIVE_HOLD)) return

      origin = { x: touch.clientX, y: touch.clientY }
      timer = setTimeout(() => {
        fired = true
        target.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: origin.x,
            clientY: origin.y,
          })
        )
      }, LONG_PRESS.delay)
    }

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (Math.hypot(touch.clientX - origin.x, touch.clientY - origin.y) > LONG_PRESS.slop) cancel()
    }

    // The lift after a hold must not click what was held
    const onEnd = (event: TouchEvent) => {
      cancel()
      if (fired && event.cancelable) event.preventDefault()
      fired = false
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', cancel)

    return () => {
      cancel()
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', cancel)
    }
  }, [])
}
