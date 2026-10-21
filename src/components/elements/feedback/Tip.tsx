'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { FloatingLayer } from '@/components/structures/overlays/FloatingLayer'
import { TIP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface TipProps {
  label: string
  className?: string
  // Bubble lifted to the body, never clipped by a panel
  floating?: boolean
  children: ReactNode
}

/**
 * Instant label above a glyph, arrow pointing at it
 * @param {string} label - Name shown
 * @param {string} [className] - Wrapper classes
 * @param {boolean} [floating] - Bubble lifted out of clipping parents
 * @param {ReactNode} children - Glyph hovered
 * @return {JSX.Element}
 */

export const Tip = ({ label, className, floating, children }: TipProps) => {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)

  if (floating) {
    return (
      <span
        className={cn(TIP.wrapper, className)}
        onMouseEnter={(event) => setAnchor(event.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => setAnchor(null)}
      >
        {children}
        {anchor && (
          <FloatingLayer>
            <span
              role="tooltip"
              className={TIP.floating}
              style={{ left: anchor.left + anchor.width / 2, top: anchor.top - 8 }}
            >
              {label}
              <span className={TIP.arrow} aria-hidden="true" />
            </span>
          </FloatingLayer>
        )}
      </span>
    )
  }

  return (
    <span className={cn(TIP.wrapper, className)}>
      {children}
      <span role="tooltip" className={TIP.pop}>
        {label}
        <span className={TIP.arrow} aria-hidden="true" />
      </span>
    </span>
  )
}
