'use client'

import { useState } from 'react'
import { AddRow } from '@/components/structures/AddRow'
import { INLINE_EDIT_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface InlineCreateProps {
  label: string
  maxLength?: number
  // Grid cell rather than a list row
  tile?: boolean
  className?: string
  // Resolves true once the entry exists
  onCommit: (value: string) => Promise<boolean>
}

/**
 * Dashed creation row turning into a field on click
 * @param {string} label - Creation label
 * @param {number} [maxLength] - Longest accepted text
 * @param {boolean} [tile] - Stacks the glyph above the label
 * @param {string} [className] - Extra classes merged onto the row
 * @param {(value: string) => Promise<boolean>} onCommit - Creates the entry
 * @return {JSX.Element}
 */

export const InlineCreate = ({
  label,
  maxLength,
  tile,
  className,
  onCommit,
}: InlineCreateProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const close = () => {
    setDraft('')
    setEditing(false)
  }

  const commit = async () => {
    const next = draft.trim()
    if (next) await onCommit(next)
    close()
  }

  if (!editing) {
    return (
      <AddRow label={label} tile={tile} className={className} onClick={() => setEditing(true)} />
    )
  }

  return (
    <input
      ref={(node) => node?.focus()}
      value={draft}
      maxLength={maxLength}
      placeholder={label}
      aria-label={label}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') void commit()
        if (event.key === 'Escape') close()
      }}
      className={cn(INLINE_EDIT_STYLES.create, tile && INLINE_EDIT_STYLES.createTile, className)}
    />
  )
}
