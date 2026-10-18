'use client'

import { useCallback, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { GESTURE_SETTINGS } from '@/declarations/configurations/settings'

// Attribute carrying the id of a selectable item
export const SELECTABLE_ATTRIBUTE = 'data-select-id'

// Targets that keep their own click
const INTERACTIVE = `[${SELECTABLE_ATTRIBUTE}], button, a, input, textarea, select, [role="button"]`

/**
 * Rectangle drawn on screen
 * @typedef {Object} MarqueeRect
 * @property {number} left - Viewport x
 * @property {number} top - Viewport y
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 */

export interface MarqueeRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Marquee state and handler
 * @typedef {Object} Marquee
 * @property {MarqueeRect | null} rect - Rectangle being drawn
 * @property {(event: ReactPointerEvent<HTMLElement>) => void} onPointerDown - Start a drag
 */

export interface Marquee {
  rect: MarqueeRect | null
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
}

// Box spanned by two points
const boxOf = (from: { x: number; y: number }, to: { x: number; y: number }): MarqueeRect => ({
  left: Math.min(from.x, to.x),
  top: Math.min(from.y, to.y),
  width: Math.abs(to.x - from.x),
  height: Math.abs(to.y - from.y),
})

// Ids of the items a box touches
const caughtBy = (container: HTMLElement, box: MarqueeRect): string[] =>
  [...container.querySelectorAll<HTMLElement>(`[${SELECTABLE_ATTRIBUTE}]`)]
    .filter((node) => {
      const bounds = node.getBoundingClientRect()

      return (
        bounds.right > box.left &&
        bounds.left < box.left + box.width &&
        bounds.bottom > box.top &&
        bounds.top < box.top + box.height
      )
    })
    .map((node) => node.getAttribute(SELECTABLE_ATTRIBUTE)!)

/**
 * Draw a rectangle over empty space to select the items it touches
 * @param {boolean} enabled - Gesture is available
 * @param {(ids: string[], additive: boolean) => void} onSelect - Called once the drag ends
 * @return {Marquee} - Rectangle and pointer handler
 */

export const useMarquee = (
  enabled: boolean,
  onSelect: (ids: string[], additive: boolean) => void
): Marquee => {
  const [rect, setRect] = useState<MarqueeRect | null>(null)

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      // A finger scrolls instead
      if (!enabled || event.button !== 0 || event.pointerType === 'touch') return
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return

      const container = event.currentTarget
      const origin = { x: event.clientX, y: event.clientY }
      const additive = event.ctrlKey || event.metaKey || event.shiftKey
      let box: MarqueeRect | null = null

      const keepText = (selection: Event) => selection.preventDefault()

      const move = (next: globalThis.PointerEvent) => {
        const travelled = Math.hypot(next.clientX - origin.x, next.clientY - origin.y)
        if (!box && travelled < GESTURE_SETTINGS.startSlopPx) return

        box = boxOf(origin, { x: next.clientX, y: next.clientY })
        setRect(box)
      }

      const end = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', end)
        window.removeEventListener('pointercancel', end)
        document.removeEventListener('selectstart', keepText)
        setRect(null)

        // A bare click on empty space drops the selection
        onSelect(box ? caughtBy(container, box) : [], additive)
      }

      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', end)
      window.addEventListener('pointercancel', end)
      document.addEventListener('selectstart', keepText)
    },
    [enabled, onSelect]
  )

  return { rect, onPointerDown }
}
