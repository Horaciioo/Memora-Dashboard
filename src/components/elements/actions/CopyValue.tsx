'use client'

import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { COPY_VALUE } from '@/declarations/ui/variants'

export interface CopyValueProps {
  value: string
}

/**
 * Value followed by a small copy glyph
 * @param {string} value - Text shown and copied
 * @return {JSX.Element}
 */

export const CopyValue = ({ value }: CopyValueProps) => {
  const copy = useCopy(ACTION_COPY.idCopied)
  const CopyIcon = ICONS.copy

  return (
    <span className={COPY_VALUE.root}>
      {value}
      <button
        type="button"
        title={ACTION_COPY.copyId}
        aria-label={ACTION_COPY.copyId}
        className={COPY_VALUE.button}
        onClick={(event) => {
          // Never opens the in-place editor
          event.stopPropagation()
          void copy(value)
        }}
      >
        <CopyIcon className={COPY_VALUE.glyph} aria-hidden="true" />
      </button>
    </span>
  )
}
