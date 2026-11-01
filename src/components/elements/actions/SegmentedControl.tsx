'use client'

import { SEGMENTED_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SegmentedOption<TValue extends string> {
  value: TValue
  label: string
  // Spans the row, options sharing it evenly
  isFull?: boolean
}

export interface SegmentedControlProps<TValue extends string> {
  options: SegmentedOption<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
  // Names the group for assistive technology
  label: string
  // Spans the row, options sharing it evenly
  isFull?: boolean
}

/**
 * Inline single-choice switch
 * @param {SegmentedOption<TValue>[]} options - Selectable options
 * @param {TValue} value - Selected value
 * @param {(value: TValue) => void} onChange - Selection handler
 * @param {string} label - Accessible group name
 * @param {boolean} [isFull] - Spans the row
 * @return {JSX.Element}
 */

export const SegmentedControl = <TValue extends string>({
  options,
  value,
  onChange,
  label,
  isFull,
}: SegmentedControlProps<TValue>) => (
  <div
    className={cn(SEGMENTED_STYLES.group, isFull && SEGMENTED_STYLES.full)}
    role="group"
    aria-label={label}
  >
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
            isFull && SEGMENTED_STYLES.optionFull,
            isSelected ? SEGMENTED_STYLES.selected : SEGMENTED_STYLES.idle
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)
