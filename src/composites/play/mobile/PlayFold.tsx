'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_FOLD, PLAY_STATS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Stats section, foldable on a phone only
 * @param {Object} props - Section
 * @param {string} props.title - Heading
 * @param {ReactNode} props.children - Body
 * @return {JSX.Element}
 */

export const PlayFold = ({ title, children }: { title: string; children: ReactNode }) => {
  const isMobile = useIsMobileShell()
  const [isOpen, setOpen] = useState(true)
  const ChevronIcon = ICONS.expand

  if (!isMobile) {
    return (
      <section className={PLAY_STATS.section}>
        <h2 className={PLAY_STATS.heading}>{title}</h2>
        {children}
      </section>
    )
  }

  return (
    <section className={PLAY_STATS.section}>
      <button
        type="button"
        aria-expanded={isOpen}
        className={PLAY_FOLD.head}
        onClick={() => setOpen((value) => !value)}
      >
        <h2 className={PLAY_STATS.heading}>{title}</h2>
        <ChevronIcon
          className={cn(PLAY_FOLD.chevron, isOpen && PLAY_FOLD.chevronOpen)}
          aria-hidden="true"
        />
      </button>
      {isOpen && <div className={PLAY_FOLD.body}>{children}</div>}
    </section>
  )
}
