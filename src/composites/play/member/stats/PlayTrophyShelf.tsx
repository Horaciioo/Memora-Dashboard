'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_FOLD, PLAY_SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayTrophyShelfProps {
  // Title row: logo, name, count
  head: ReactNode
  children: ReactNode
}

/**
 * One shelf of the collection, closed on a phone until touched
 * @param {PlayTrophyShelfProps} props - Head and trophies
 * @return {JSX.Element}
 */

export const PlayTrophyShelf = ({ head, children }: PlayTrophyShelfProps) => {
  const isMobile = useIsMobileShell()
  const [isOpen, setOpen] = useState(false)
  const ChevronIcon = ICONS.expand

  if (!isMobile) {
    return (
      <section className={PLAY_SHOWCASE.section}>
        <h3 className={PLAY_SHOWCASE.sectionHead}>{head}</h3>
        {children}
      </section>
    )
  }

  return (
    <section className={PLAY_SHOWCASE.section}>
      <button
        type="button"
        aria-expanded={isOpen}
        className={PLAY_FOLD.head}
        onClick={() => setOpen((value) => !value)}
      >
        <h3 className={cn(PLAY_SHOWCASE.sectionHead, 'min-w-0 flex-1')}>{head}</h3>
        <ChevronIcon
          className={cn(PLAY_FOLD.chevron, isOpen && PLAY_FOLD.chevronOpen)}
          aria-hidden="true"
        />
      </button>
      {isOpen && children}
    </section>
  )
}
