import type { ReactNode } from 'react'

import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseRevealProps {
  isOn: boolean
  delayMs?: number
  className?: string
  children: ReactNode
}

/**
 * Element rising in
 * @param {boolean} isOn - Shown yet
 * @param {number} [delayMs] - Wait before it rises
 * @param {string} [className] - Extra classes
 * @param {ReactNode} children - Content
 * @return {JSX.Element}
 */

export const ShowcaseReveal = ({ isOn, delayMs, className, children }: ShowcaseRevealProps) => (
  <div
    className={cn(SHOWCASE.reveal, isOn ? SHOWCASE.shown : SHOWCASE.hidden, className)}
    style={{ transitionDelay: isOn && delayMs ? `${delayMs}ms` : undefined }}
  >
    {children}
  </div>
)
