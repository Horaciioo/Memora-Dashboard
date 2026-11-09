'use client'

import { MODVIEW_POLL_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_POLL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface FoldToggleProps {
  isFolded: boolean
  onToggle: () => void
}

/**
 * Folds a banner above the chat
 * @param {boolean} isFolded - Banner folded
 * @param {() => void} onToggle - Fold handler
 * @return {JSX.Element}
 */

export const FoldToggle = ({ isFolded, onToggle }: FoldToggleProps) => {
  const FoldIcon = ICONS.modFold
  const label = isFolded ? MODVIEW_POLL_COPY.unfold : MODVIEW_POLL_COPY.fold

  return (
    <button
      type="button"
      className={MODVIEW_POLL.fold}
      aria-expanded={!isFolded}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <FoldIcon
        className={cn(MODVIEW_POLL.foldIcon, isFolded && MODVIEW_POLL.foldIconClosed)}
        aria-hidden="true"
      />
    </button>
  )
}
