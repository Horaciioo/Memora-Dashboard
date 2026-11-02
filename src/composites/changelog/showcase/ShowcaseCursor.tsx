import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

import { SHOWCASE_CURSOR } from '@/declarations/changelog/showcase'
import { SHOWCASE } from '@/declarations/ui/variants'

export interface ShowcaseCursorProps {
  step: number
  scale: number
  rootRef: RefObject<HTMLDivElement | null>
}

// Wait for the target to show
const CURSOR_DELAY_MS = 250

// Pointer arrow
const ARROW = 'M5 3l14 8-6 2 4 7-3 1.5-4-7-5 4z'

/**
 * Pointer gliding to the target of the step, ringing on a click
 * @param {number} step - Current step
 * @param {number} scale - Dashboard scale
 * @param {RefObject<HTMLDivElement | null>} rootRef - Dashboard
 * @return {JSX.Element | null}
 */

export const ShowcaseCursor = ({ step, scale, rootRef }: ShowcaseCursorProps) => {
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null)
  const move = SHOWCASE_CURSOR[step]

  // Target centre in dashboard pixels
  useEffect(() => {
    if (!move) return

    const timer = setTimeout(() => {
      const root = rootRef.current
      const target = root?.querySelector(`[data-showcase="${move.target}"]`)
      if (!root || !target) return

      const box = target.getBoundingClientRect()
      const origin = root.getBoundingClientRect()
      setSpot({
        x: (box.left + box.width / 2 - origin.left) / scale,
        y: (box.top + box.height / 2 - origin.top) / scale,
      })
    }, CURSOR_DELAY_MS)

    return () => clearTimeout(timer)
  }, [move, scale, rootRef])

  if (!spot) return null

  return (
    <div className={SHOWCASE.cursor} style={{ transform: `translate(${spot.x}px, ${spot.y}px)` }}>
      {move?.isClick && <span key={step} className={SHOWCASE.click} />}
      <svg viewBox="0 0 24 24" className={SHOWCASE.cursorGlyph} aria-hidden="true">
        <path d={ARROW} fill="white" stroke="black" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
