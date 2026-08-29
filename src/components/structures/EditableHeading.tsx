'use client'

import { useId, useState } from 'react'
import { Glyph } from '@/components/elements/display/Glyph'
import { EmojiPicker } from '@/components/elements/forms/EmojiPicker'
import { EMOJI_COPY } from '@/declarations/ui/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface EditableHeadingProps {
  value: string
  // Emoji of the record, drawn bare before the title
  glyph?: string | null
  disabled: boolean
  onCommit: (value: string) => Promise<boolean>
  // Persists a picked glyph, absent while the record carries none
  onGlyphCommit?: (value: string | null) => Promise<boolean>
}

/**
 * Page title that swaps for an input on click, its glyph picked right beside it
 * @param {string} value - Current title
 * @param {string | null} [glyph] - Emoji of the record
 * @param {boolean} disabled - Blocks editing
 * @param {(value: string) => Promise<boolean>} onCommit - Persists the new title
 * @param {(value: string | null) => Promise<boolean>} [onGlyphCommit] - Persists the picked glyph
 * @return {JSX.Element}
 */

export const EditableHeading = ({
  value,
  glyph,
  disabled,
  onCommit,
  onGlyphCommit,
}: EditableHeadingProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const pickerId = useId()

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

  return (
    <div className={PAGE_STYLES.heading}>
      {onGlyphCommit && !disabled ? (
        <EmojiPicker
          id={pickerId}
          label={EMOJI_COPY.choose}
          value={glyph ?? ''}
          onChange={(next) => void onGlyphCommit(next)}
        />
      ) : (
        <Glyph value={glyph ?? null} size="title" />
      )}

      {editing ? (
        <input
          ref={(node) => node?.focus()}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void commit()
            if (event.key === 'Escape') setEditing(false)
          }}
          className={cn(PAGE_STYLES.title, PAGE_STYLES.headingTitle, PAGE_STYLES.titleInput)}
        />
      ) : (
        <h1
          role={disabled ? undefined : 'button'}
          tabIndex={disabled ? undefined : 0}
          onClick={start}
          onKeyDown={(event) => {
            if (event.key === 'Enter') start()
          }}
          className={cn(
            PAGE_STYLES.title,
            PAGE_STYLES.headingTitle,
            !disabled && PAGE_STYLES.titleEditable
          )}
        >
          {value}
        </h1>
      )}
    </div>
  )
}
