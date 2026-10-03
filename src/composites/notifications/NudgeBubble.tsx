'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { NUDGE_SETTINGS } from '@/declarations/configurations/settings'
import { NUDGE } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'

export interface NudgeBubbleProps {
  // Fully folded
  onGone: () => void
  // Handed the fold
  children: (fold: () => void) => ReactNode
}

/**
 * Bubble pointing at a rail entry
 * @param {() => void} onGone - Folded callback
 * @param {(fold: () => void) => ReactNode} children - Content
 * @return {JSX.Element}
 */

export const NudgeBubble = ({ onGone, children }: NudgeBubbleProps) => {
  const [isClosing, setClosing] = useState(false)
  const goneRef = useRef(onGone)

  // Latest callback
  useEffect(() => {
    goneRef.current = onGone
  }, [onGone])

  const fold = useCallback(() => setClosing(true), [])

  // Hold, then fold
  useEffect(() => {
    const timer = window.setTimeout(fold, NUDGE_SETTINGS.holdMs)

    return () => window.clearTimeout(timer)
  }, [fold])

  // Hand over once folded
  useEffect(() => {
    if (!isClosing) return

    const timer = window.setTimeout(() => goneRef.current(), NUDGE_SETTINGS.closeMs)

    return () => window.clearTimeout(timer)
  }, [isClosing])

  return (
    <div
      className={cn(NUDGE.bubble, isClosing && NUDGE.closing)}
      style={isClosing ? { animationDuration: `${NUDGE_SETTINGS.closeMs}ms` } : undefined}
      role="status"
    >
      <svg viewBox="0 0 12 18" className={NUDGE.tail} aria-hidden="true">
        <path
          d="M12 0.5C8.6 3 4.6 6.4 1.3 8.1a1.05 1.05 0 0 0 0 1.8C4.6 11.6 8.6 15 12 17.5Z"
          fill="currentColor"
        />
      </svg>
      {children(fold)}
    </div>
  )
}
