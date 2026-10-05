'use client'

import { useMemo, useState } from 'react'

import { Input } from '@/components/elements/forms/Input'
import { Dialog } from '@/components/structures/Dialog'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { COLOUR_FIELD_STYLES, EMOJI_DIALOG_STYLES } from '@/declarations/ui/variants'
import { ICON_NAMES, ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface IconPickerProps {
  id: string
  label: string
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

/**
 * Collapsed glyph control
 * @param {string} id - Identifier of the trigger
 * @param {string} label - Accessible name of the field
 * @param {string | null} value - Stored glyph key
 * @param {(value: string | null) => void} onChange - Glyph handler
 * @param {boolean} [disabled] - Blocks the control
 * @return {JSX.Element}
 */

export const IconPicker = ({ id, label, value, onChange, disabled }: IconPickerProps) => {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')

  const Picked = value && value in ICONS ? ICONS[value as keyof typeof ICONS] : null

  // Search-filtered glyph keys
  const names = useMemo(() => {
    const needle = term.trim().toLowerCase()

    return needle.length === 0
      ? ICON_NAMES
      : ICON_NAMES.filter((name) => name.toLowerCase().includes(needle))
  }, [term])

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label} — ${value ?? ACCESS_COPY.displayIconNone}`}
        className={COLOUR_FIELD_STYLES.trigger}
        onClick={() => setOpen(true)}
      >
        <span className={cn(COLOUR_FIELD_STYLES.swatch, 'flex items-center justify-center')}>
          {Picked && <Picked className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
        <span className={value ? COLOUR_FIELD_STYLES.code : COLOUR_FIELD_STYLES.placeholder}>
          {value ?? ACCESS_COPY.displayIconNone}
        </span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={label} size="md">
        <div className={EMOJI_DIALOG_STYLES.body}>
          <Input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={ACCESS_COPY.search}
            aria-label={ACCESS_COPY.search}
          />
          <div className={EMOJI_DIALOG_STYLES.grid}>
            <button
              type="button"
              className={cn(
                EMOJI_DIALOG_STYLES.cell,
                value === null && EMOJI_DIALOG_STYLES.cellSelected
              )}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              &times;
            </button>
            {names.map((name) => {
              const Glyph = ICONS[name]

              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  className={cn(
                    EMOJI_DIALOG_STYLES.cell,
                    value === name && EMOJI_DIALOG_STYLES.cellSelected
                  )}
                  onClick={() => {
                    onChange(name)
                    setOpen(false)
                  }}
                >
                  <Glyph className="h-4 w-4" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </Dialog>
    </>
  )
}
