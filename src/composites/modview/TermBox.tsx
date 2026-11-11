'use client'

import type { ReactNode } from 'react'

import { MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_TERMS } from '@/declarations/ui/variants'

export interface TermBoxProps {
  term: string
  // Absent when the word is read only
  onRemove?: () => void
  title?: string
  // Settings of the word, before the cross
  children?: ReactNode
}

/**
 * One word in its own box, a cross to remove it
 * @param {TermBoxProps} props - Word, remove handler, hint and settings
 * @return {JSX.Element}
 */

export const TermBox = ({ term, onRemove, title, children }: TermBoxProps) => {
  const label = MODVIEW_PERSONAL_COPY.remove.replace('{term}', term)

  return (
    <li className={MODVIEW_TERMS.item} title={title}>
      <span className={MODVIEW_TERMS.word}>{term}</span>
      <span className={MODVIEW_TERMS.tools}>
        {children}
        {onRemove && (
          <button
            type="button"
            className={MODVIEW_TERMS.remove}
            aria-label={label}
            title={label}
            onClick={onRemove}
          >
            <ICONS.close className={MODVIEW_TERMS.removeIcon} aria-hidden="true" />
          </button>
        )}
      </span>
    </li>
  )
}
