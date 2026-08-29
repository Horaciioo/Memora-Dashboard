'use client'

import { useState } from 'react'
import { EmojiDialog } from '@/components/elements/forms/EmojiDialog'
import { EMOJI_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { EMOJI_PICKER_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface EmojiPickerProps {
  id: string
  label: string
  value: string
  onChange: (value: string | null) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

/**
 * Chosen glyph standing alone beside a title, opening the catalogue on click
 * @param {string} id - Identifier of the control
 * @param {string} label - Accessible name of the picker
 * @param {string} value - Stored glyph
 * @param {(value: string | null) => void} onChange - Glyph handler
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection colour
 * @param {string} [describedBy] - Identifier of the describing message
 * @return {JSX.Element}
 */

export const EmojiPicker = ({
  id,
  label,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: EmojiPickerProps) => {
  const [open, setOpen] = useState(false)
  const Empty = ICONS.emoji

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label} — ${value === '' ? EMOJI_COPY.none : value}`}
        aria-describedby={describedBy}
        title={value === '' ? EMOJI_COPY.choose : EMOJI_COPY.change}
        className={cn(EMOJI_PICKER_STYLES.trigger, invalid && EMOJI_PICKER_STYLES.invalid)}
        onClick={() => setOpen(true)}
      >
        {value === '' ? (
          <Empty className={EMOJI_PICKER_STYLES.icon} aria-hidden="true" />
        ) : (
          <span className={EMOJI_PICKER_STYLES.glyph}>{value}</span>
        )}
      </button>

      <EmojiDialog open={open} value={value} onSelect={onChange} onClose={() => setOpen(false)} />
    </>
  )
}
