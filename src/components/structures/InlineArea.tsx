'use client'

import { useState } from 'react'
import { INLINE_EDIT_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface InlineAreaProps {
  id: string
  value: string
  // Shown while blank
  placeholder: string
  disabled?: boolean
  maxLength?: number
  className?: string
  onCommit: (value: string) => Promise<boolean>
}

/**
 * Click-to-edit multi line text
 * @param {string} id - Identifier of the textarea
 * @param {string} value - Current text
 * @param {string} placeholder - Line shown while blank
 * @param {boolean} [disabled] - Blocks editing
 * @param {number} [maxLength] - Longest accepted text
 * @param {string} [className] - Classes shared by the text and the textarea
 * @param {(value: string) => Promise<boolean>} onCommit - Persists the new text
 * @return {JSX.Element}
 */

export const InlineArea = ({
  id,
  value,
  placeholder,
  disabled,
  maxLength,
  className,
  onCommit,
}: InlineAreaProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const start = () => {
    if (disabled) return
    setDraft(value)
    setEditing(true)
  }

  const commit = async () => {
    const next = draft.trim()
    if (next !== value) await onCommit(next)
    setEditing(false)
  }

  if (editing) {
    return (
      <textarea
        id={id}
        ref={(node) => node?.focus()}
        value={draft}
        rows={Math.max(3, draft.split('\n').length)}
        maxLength={maxLength}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setEditing(false)
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) void commit()
        }}
        className={cn(INLINE_EDIT_STYLES.input, INLINE_EDIT_STYLES.area, className)}
      />
    )
  }

  return (
    <div
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      onClick={start}
      onKeyDown={(event) => {
        if (event.key === 'Enter') start()
      }}
      className={cn(className, !disabled && INLINE_EDIT_STYLES.block)}
    >
      {value || <span className={INLINE_EDIT_STYLES.placeholder}>{placeholder}</span>}
    </div>
  )
}
