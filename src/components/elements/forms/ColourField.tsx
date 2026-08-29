'use client'

import { useState } from 'react'
import { ColourWheel } from '@/components/elements/forms/ColourWheel'
import { Dialog } from '@/components/structures/Dialog'
import { COLOUR_COPY } from '@/declarations/ui/copy'
import { COLOUR_FIELD_STYLES, FIELD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { isHexColour } from '@/utils/format/colour'

export interface ColourFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string | null) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

/**
 * Collapsed colour control, the wheel opening in a modal
 * @param {string} id - Identifier of the trigger
 * @param {string} label - Accessible name of the field
 * @param {string} value - Stored colour
 * @param {(value: string | null) => void} onChange - Colour handler
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection border
 * @param {string} [describedBy] - Identifier of the describing message
 * @return {JSX.Element}
 */

export const ColourField = ({
  id,
  label,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: ColourFieldProps) => {
  const [open, setOpen] = useState(false)
  const picked = isHexColour(value)

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label} — ${picked ? value.toUpperCase() : COLOUR_COPY.none}`}
        aria-describedby={describedBy}
        title={COLOUR_COPY.pick}
        className={cn(COLOUR_FIELD_STYLES.trigger, invalid && FIELD_STYLES.invalid)}
        onClick={() => setOpen(true)}
      >
        <span
          className={COLOUR_FIELD_STYLES.swatch}
          style={picked ? { backgroundColor: value } : undefined}
          aria-hidden="true"
        />
        <span className={cn(COLOUR_FIELD_STYLES.code, !picked && COLOUR_FIELD_STYLES.placeholder)}>
          {picked ? value.toUpperCase() : COLOUR_COPY.none}
        </span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={label} size="sm">
        <div className={COLOUR_FIELD_STYLES.dialog}>
          <ColourWheel
            id={`${id}-wheel`}
            label={label}
            value={value}
            disabled={disabled}
            onChange={onChange}
          />
        </div>
      </Dialog>
    </>
  )
}
