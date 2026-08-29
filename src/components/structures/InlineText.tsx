'use client'

import { useState } from 'react'
import { INLINE_EDIT_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface InlineTextProps {
  id: string
  value: string
  disabled?: boolean
  maxLength?: number
  // Shared by the text and its input
  className?: string
  onCommit: (value: string) => Promise<boolean>
}

/**
 * Click-to-edit single line
 * @param {string} id - Identifier of the input
 * @param {string} value - Current text
 * @param {boolean} [disabled] - Blocks editing
 * @param {number} [maxLength] - Longest accepted text
 * @param {string} [className] - Classes shared by the text and the input
 * @param {(value: string) => Promise<boolean>} onCommit - Persists the new text
 * @return {JSX.Element}
 */

export const InlineText = ({
  id,
  value,
  disabled,
  maxLength,
  className,
  onCommit,
}: InlineTextProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const start = () => {
    if (disabled) return
    setDraft(value)
    setEditing(true)
  }

  const commit = async () => {
    const next = draft.trim()
    if (next && next !== value) await onCommit(next)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        id={id}
        ref={(node) => node?.focus()}
        value={draft}
        maxLength={maxLength}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void commit()
          if (event.key === 'Escape') setEditing(false)
        }}
        className={cn(INLINE_EDIT_STYLES.input, className)}
      />
    )
  }

  return (
    <span
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      onClick={start}
      onKeyDown={(event) => {
        if (event.key === 'Enter') start()
      }}
      className={cn(className, !disabled && INLINE_EDIT_STYLES.text)}
    >
      {value}
    </span>
  )
}
