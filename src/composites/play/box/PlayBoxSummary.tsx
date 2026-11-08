import type { ReactNode } from 'react'

import { ICONS } from '@/declarations/ui/icons'
import { PLAY_BOX } from '@/declarations/ui/variants'

export interface PlayBoxSummaryProps {
  title: string
  note?: string
  label: string
  showExpandIcon?: boolean
  // Faces or marks shown before the opener
  aside?: ReactNode
  onOpen: () => void
}

/**
 * Folded box: the whole box opens it
 * @param {PlayBoxSummaryProps} props - Title, note, aside and opener
 * @return {JSX.Element}
 */

export const PlayBoxSummary = ({
  title,
  note,
  label,
  showExpandIcon = true,
  aside,
  onOpen,
}: PlayBoxSummaryProps) => {
  const OpenIcon = ICONS.expand

  return (
    <button type="button" aria-label={label} className={PLAY_BOX.summary} onClick={onOpen}>
      <span className={PLAY_BOX.summaryText}>
        <span className={PLAY_BOX.summaryName}>{title}</span>
        {note && <span className={PLAY_BOX.summaryNote}>{note}</span>}
      </span>
      {aside}
      {showExpandIcon && <OpenIcon className={PLAY_BOX.keyIcon} aria-hidden="true" />}
    </button>
  )
}
