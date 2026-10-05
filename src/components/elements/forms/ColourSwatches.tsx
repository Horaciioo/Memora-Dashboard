'use client'

import { COLOUR_SETTINGS } from '@/declarations/configurations/settings'
import { COLOUR_COPY, PICKER_COPY } from '@/declarations/ui/copy'
import { COLOUR_SWATCH_STYLES, FIELD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { normaliseHex } from '@/utils/format/colour'

export interface ColourSwatchesProps {
  id: string
  value: string
  onChange: (value: string | null) => void
  disabled?: boolean
}

/**
 * Fixed palette of accents
 * @param {ColourSwatchesProps} props - Stored colour and handler
 * @return {JSX.Element}
 */

export const ColourSwatches = ({ id, value, onChange, disabled }: ColourSwatchesProps) => {
  const picked = normaliseHex(value)

  return (
    <div id={id} className={COLOUR_SWATCH_STYLES.wrapper}>
      <div className={COLOUR_SWATCH_STYLES.grid} aria-label={COLOUR_COPY.swatches} role="group">
        {COLOUR_SETTINGS.swatches.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={swatch}
            aria-pressed={picked === swatch}
            disabled={disabled}
            className={cn(
              COLOUR_SWATCH_STYLES.swatch,
              picked === swatch && COLOUR_SWATCH_STYLES.selected
            )}
            style={{ backgroundColor: swatch }}
            onClick={() => onChange(swatch)}
          />
        ))}
      </div>
      <button
        type="button"
        className={FIELD_STYLES.hint}
        disabled={disabled}
        onClick={() => onChange(null)}
      >
        {PICKER_COPY.clear}
      </button>
    </div>
  )
}
