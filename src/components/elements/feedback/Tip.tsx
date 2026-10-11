import type { ReactNode } from 'react'

import { TIP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface TipProps {
  label: string
  className?: string
  children: ReactNode
}

/**
 * Instant label above a glyph, arrow pointing at it
 * @param {string} label - Name shown
 * @param {string} [className] - Wrapper classes
 * @param {ReactNode} children - Glyph hovered
 * @return {JSX.Element}
 */

export const Tip = ({ label, className, children }: TipProps) => (
  <span className={cn(TIP.wrapper, className)}>
    {children}
    <span role="tooltip" className={TIP.pop}>
      {label}
      <span className={TIP.arrow} aria-hidden="true" />
    </span>
  </span>
)
