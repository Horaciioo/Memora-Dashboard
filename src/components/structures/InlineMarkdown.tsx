'use client'

import { useState } from 'react'
import type { FocusEvent, KeyboardEvent } from 'react'
import { Markdown } from '@/components/elements/display/Markdown'
import { MarkdownEditor } from '@/components/elements/forms/MarkdownEditor'
import { INLINE_EDIT_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface InlineMarkdownProps {
  id: string
  value: string
  // Shown while blank
  placeholder: string
  disabled?: boolean
  maxLength?: number
  onCommit: (value: string) => Promise<boolean>
}

/**
 * Click-to-edit markdown block
 * @param {string} id - Identifier of the editor
 * @param {string} value - Stored markdown
 * @param {string} placeholder - Line shown while blank
 * @param {boolean} [disabled] - Blocks editing
 * @param {number} [maxLength] - Longest accepted text
 * @param {(value: string) => Promise<boolean>} onCommit - Persists the new text
 * @return {JSX.Element}
 */

export const InlineMarkdown = ({
  id,
  value,
  placeholder,
  disabled,
  maxLength,
  onCommit,
}: InlineMarkdownProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [pending, setPending] = useState(false)

  const start = () => {
    if (disabled) return
    setDraft(value)
    setEditing(true)
  }

  const commit = async () => {
    // Untouched, skip the save
    if (draft === value) {
      setEditing(false)
      return
    }

    setPending(true)
    const ok = await onCommit(draft)
    setPending(false)
    if (ok) setEditing(false)
  }

  // Blur outside the editor saves
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    void commit()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div onBlur={onBlur} onKeyDown={onKeyDown}>
        <MarkdownEditor id={id} value={draft} maxLength={maxLength} onChange={setDraft} />
      </div>
    )
  }

  return (
    <div
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      aria-disabled={pending || undefined}
      onClick={start}
      onKeyDown={(event) => {
        if (event.key === 'Enter') start()
      }}
      className={cn(!disabled && INLINE_EDIT_STYLES.block)}
    >
      {value.trim().length > 0 ? (
        <Markdown source={value} />
      ) : (
        <p className={INLINE_EDIT_STYLES.placeholder}>{placeholder}</p>
      )}
    </div>
  )
}
