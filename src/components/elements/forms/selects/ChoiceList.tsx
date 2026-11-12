'use client'

import { CHOICE_LIST_STYLES } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface ChoiceListProps {
  id: string
  options: FieldOption[]
  value: string[]
  onChange: (value: string[]) => void
  // Names the group for assistive technology
  label: string
  multiple?: boolean
  maxItems?: number
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

/**
 * Visible radio or check list
 * @param {string} id - Group identifier
 * @param {FieldOption[]} options - Choices
 * @param {string[]} value - Picked values
 * @param {(value: string[]) => void} onChange - Pick handler
 * @param {string} label - Accessible name
 * @param {boolean} [multiple] - Several picks
 * @param {number} [maxItems] - Most picks
 * @param {boolean} [disabled] - Blocks the list
 * @param {boolean} [invalid] - Paints the rejection
 * @param {string} [describedBy] - Message identifier
 * @return {JSX.Element}
 */

export const ChoiceList = ({
  id,
  options,
  value,
  onChange,
  label,
  multiple,
  maxItems,
  disabled,
  invalid,
  describedBy,
}: ChoiceListProps) => {
  const pick = (optionValue: string) => {
    if (!multiple) return onChange([optionValue])
    onChange(
      value.includes(optionValue)
        ? value.filter((entry) => entry !== optionValue)
        : [...value, optionValue]
    )
  }

  return (
    <fieldset id={id} className={CHOICE_LIST_STYLES.group} aria-describedby={describedBy}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const checked = value.includes(option.value)
        // A full selection only lets go
        const isLocked = multiple && !checked && maxItems !== undefined && value.length >= maxItems

        return (
          <label
            key={option.value}
            className={cn(CHOICE_LIST_STYLES.row, invalid && CHOICE_LIST_STYLES.rowInvalid)}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={id}
              className={CHOICE_LIST_STYLES.input}
              checked={checked}
              disabled={disabled || option.disabled || isLocked}
              onChange={() => pick(option.value)}
            />
            <span
              aria-hidden="true"
              className={cn(
                CHOICE_LIST_STYLES.mark,
                multiple ? CHOICE_LIST_STYLES.markCheck : CHOICE_LIST_STYLES.markRadio
              )}
            >
              <span className={multiple ? CHOICE_LIST_STYLES.tick : CHOICE_LIST_STYLES.dot} />
            </span>
            <span className={CHOICE_LIST_STYLES.label}>{option.label}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
