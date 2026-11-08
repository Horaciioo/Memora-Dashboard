'use client'

import { ICONS, type IconName } from '@/declarations/ui/icons'
import { SEGMENTED_PLAY, SEGMENTED_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SegmentedOption<TValue extends string> {
  value: TValue
  label: string
  // Shown alone, the label stays as the accessible name
  icon?: IconName
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
  // Dressed for Memora Play
  isPlay?: boolean
}

/**
 * Inline single-choice switch
 * @param {SegmentedOption<TValue>[]} options - Selectable options
 * @param {TValue} value - Selected value
 * @param {(value: TValue) => void} onChange - Selection handler
 * @param {string} label - Accessible group name
 * @param {boolean} [isFull] - Spans the row
 * @param {boolean} [isPlay] - Memora Play look
 * @return {JSX.Element}
 */

export const SegmentedControl = <TValue extends string>({
  options,
  value,
  onChange,
  label,
  isFull,
  isPlay,
}: SegmentedControlProps<TValue>) => (
  <div
    className={
      isPlay ? SEGMENTED_PLAY.group : cn(SEGMENTED_STYLES.group, isFull && SEGMENTED_STYLES.full)
    }
    role="group"
    aria-label={label}
  >
    {options.map((option) => {
      const isSelected = option.value === value
      const Icon = option.icon ? ICONS[option.icon] : null

      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={isSelected}
          aria-label={Icon ? option.label : undefined}
          title={Icon ? option.label : undefined}
          onClick={() => onChange(option.value)}
          className={
            isPlay
              ? cn(
                  SEGMENTED_PLAY.option,
                  isSelected ? SEGMENTED_PLAY.selected : SEGMENTED_PLAY.idle
                )
              : cn(
                  SEGMENTED_STYLES.option,
                  isFull && SEGMENTED_STYLES.optionFull,
                  isSelected ? SEGMENTED_STYLES.selected : SEGMENTED_STYLES.idle
                )
          }
        >
          {Icon ? <Icon className="size-6" aria-hidden="true" /> : option.label}
        </button>
      )
    })}
  </div>
)
