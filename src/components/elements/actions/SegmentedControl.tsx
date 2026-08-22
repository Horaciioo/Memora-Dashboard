'use client'

import { SEGMENTED_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SegmentedOption<TValue extends string> {
  value: TValue
  label: string
}

export interface SegmentedControlProps<TValue extends string> {
  options: SegmentedOption<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
  // Names the group for assistive technology
  label: string
}

/**
 * Inline single-choice switch, one button per option
 * @param {SegmentedOption<TValue>[]} options - Selectable options
 * @param {TValue} value - Selected value
 * @param {(value: TValue) => void} onChange - Selection handler
 * @param {string} label - Accessible group name
 * @return {JSX.Element}
 */

export const SegmentedControl = <TValue extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<TValue>) => (
  <div className={SEGMENTED_STYLES.group} role="group" aria-label={label}>
    {options.map((option) => {
      const isSelected = option.value === value

      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={isSelected}
          onClick={() => onChange(option.value)}
          className={cn(
            SEGMENTED_STYLES.option,
            isSelected ? SEGMENTED_STYLES.selected : SEGMENTED_STYLES.idle
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)
