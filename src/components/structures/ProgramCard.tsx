'use client'

import type { ReactNode } from 'react'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { PROGRAM_CARD, PROGRAM_ROW } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

export interface ProgramCardProps {
  title: string
  meta?: string
  // Glyph key of the function
  icon?: string | null
  accent?: string | null
  // Under the meta line
  foot?: ReactNode
  // Right edge
  side?: ReactNode
  // Dense one line version
  compact?: boolean
  menu: MenuItem[]
  onOpen: () => void
}

/**
 * Programme as a tinted spine and a body, or one line once finished
 * @param {ProgramCardProps} props - Programme
 * @return {JSX.Element}
 */

export const ProgramCard = ({
  title,
  meta,
  icon,
  accent,
  foot,
  side,
  compact,
  menu,
  onOpen,
}: ProgramCardProps) => {
  const { contextMenu } = useMenu()
  const Glyph = icon && isIconName(icon) ? ICONS[icon] : ICONS.sheet
  const Arrow = ICONS.forward

  return (
    <article
      role="button"
      tabIndex={0}
      style={accentVars(accent)}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen()
      }}
      onContextMenu={contextMenu(menu, title)}
      className={compact ? PROGRAM_ROW.row : PROGRAM_CARD.card}
    >
      {compact ? (
        <>
          <Glyph className={PROGRAM_ROW.glyph} aria-hidden="true" />
          <span className={PROGRAM_ROW.title}>{title}</span>
          {meta && <span className={PROGRAM_ROW.meta}>{meta}</span>}
        </>
      ) : (
        <>
          <span className={PROGRAM_CARD.spine}>
            <Glyph className={PROGRAM_CARD.glyph} aria-hidden="true" />
          </span>
          <div className={PROGRAM_CARD.body}>
            <h3 className={PROGRAM_CARD.title}>{title}</h3>
            {meta && <p className={PROGRAM_CARD.meta}>{meta}</p>}
            {foot}
          </div>
          <span className={PROGRAM_CARD.side}>
            {side}
            <Arrow className={cn(PROGRAM_CARD.arrow, side && 'ml-3')} aria-hidden="true" />
          </span>
        </>
      )}
    </article>
  )
}
