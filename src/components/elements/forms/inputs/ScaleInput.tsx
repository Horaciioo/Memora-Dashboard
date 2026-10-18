'use client'

import { SCALE_INPUT, SCALE_NUMERAL_TONES } from '@/declarations/ui/variants'
import { TONES } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

export interface ScaleInputProps {
  id?: string
  value: number | null
  onChange: (value: number | null) => void
  min: number
  max: number
  step?: number
  label: string
  disabled?: boolean
  lowLabel?: string
  highLabel?: string
  // Gauge or bare figures
  variant?: 'track' | 'numerals'
}

/**
 * Rating scale
 * @param {ScaleInputProps} props - Value
 * @return {JSX.Element}
 */

export const ScaleInput = ({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  disabled,
  lowLabel,
  highLabel,
  variant = 'track',
}: ScaleInputProps) => {
  const steps = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, index) => Math.round((min + index * step) * 100) / 100
  )
  const activeIndex = value === null ? -1 : steps.indexOf(value)

  // Low red
  const toneOf = (index: number) =>
    index === 0
      ? SCALE_NUMERAL_TONES.low
      : index === steps.length - 1
        ? SCALE_NUMERAL_TONES.high
        : SCALE_NUMERAL_TONES.middle

  if (variant === 'numerals') {
    return (
      <div id={id} className={SCALE_INPUT.numerals} role="radiogroup" aria-label={label}>
        {steps.map((entry, index) => {
          const isActive = value === entry

          return (
            <button
              key={entry}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(isActive ? null : entry)}
              className={cn(
                SCALE_INPUT.numeral,
                TONES[toneOf(index)].text,
                isActive ? SCALE_INPUT.numeralActive : SCALE_INPUT.numeralIdle
              )}
            >
              {entry}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={SCALE_INPUT.wrap}>
      <div id={id} className={SCALE_INPUT.track} role="radiogroup" aria-label={label}>
        {steps.map((entry, index) => {
          const isActive = value === entry
          const isFilled = activeIndex >= 0 && index <= activeIndex

          return (
            <button
              key={entry}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${entry}`}
              title={`${entry}`}
              disabled={disabled}
              onClick={() => onChange(isActive ? null : entry)}
              className={cn(
                SCALE_INPUT.step,
                isActive
                  ? SCALE_INPUT.stepActive
                  : isFilled
                    ? SCALE_INPUT.stepFilled
                    : SCALE_INPUT.stepIdle
              )}
            />
          )
        })}
      </div>

      {(lowLabel || highLabel) && (
        <div className={SCALE_INPUT.endpoints}>
          <span className={SCALE_INPUT.endpoint}>{lowLabel}</span>
          <span className={SCALE_INPUT.endpoint}>{highLabel}</span>
        </div>
      )}
    </div>
  )
}
