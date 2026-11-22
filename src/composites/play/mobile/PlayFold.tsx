'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_FOLD, PLAY_PAGE, PLAY_STATS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayFoldProps {
  title: string
  children: ReactNode
  // Spans both columns of the page grid
  isWide?: boolean
}

/**
 * Stats section: a panel of the page, foldable on a phone only
 * @param {PlayFoldProps} props - Heading, body and width
 * @return {JSX.Element}
 */

export const PlayFold = ({ title, children, isWide }: PlayFoldProps) => {
  const isMobile = useIsMobileShell()
  const [isOpen, setOpen] = useState(true)
  const ChevronIcon = ICONS.expand

  if (!isMobile) {
    return (
      <PlayPageTitle
        heading="h2"
        isGrouped
        className={isWide ? PLAY_PAGE.cellWide : PLAY_PAGE.cell}
        body={children}
      >
        {title}
      </PlayPageTitle>
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
