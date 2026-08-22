'use client'

import { Checkbox } from '@/components/elements/forms/Toggle'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface MultiSelectProps {
  id: string
  options: FieldOption[]
  value: string[]
  onChange: (value: string[]) => void
  emptyLabel: string
  maxItems?: number
}

/**
 * Scrollable checkbox list standing in for a native multiple select
 * @param {string} id - Identifier of the group
 * @param {FieldOption[]} options - Selectable options
 * @param {string[]} value - Selected values
 * @param {(value: string[]) => void} onChange - Selection handler
 * @param {string} emptyLabel - Shown when no option exists yet
 * @param {number} [maxItems] - Most entries allowed
 * @return {JSX.Element}
 */

export const MultiSelect = ({
  id,
  options,
  value,
  onChange,
  emptyLabel,
  maxItems,
}: MultiSelectProps) => {
  if (options.length === 0) {
    return <p className="text-sm text-[var(--color-ink-subtle)] italic">{emptyLabel}</p>
  }

  const toggle = (option: FieldOption) => {
    if (value.includes(option.value)) {
      onChange(value.filter((entry) => entry !== option.value))
      return
    }

    if (maxItems !== undefined && value.length >= maxItems) return

    onChange([...value, option.value])
  }

  return (
    <div
      id={id}
      role="group"
      className={cn(
        'flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1'
      )}
    >
      {options.map((option) => (
        <Checkbox
          key={option.value}
          checked={value.includes(option.value)}
          onChange={() => toggle(option)}
          label={option.label}
          hint={option.hint}
        />
      ))}
    </div>
  )
}
