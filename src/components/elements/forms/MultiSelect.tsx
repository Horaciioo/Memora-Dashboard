'use client'

import type { MouseEvent } from 'react'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { OptionMark } from '@/components/elements/forms/OptionMark'
import { ICONS } from '@/declarations/ui/icons'
import { useHints } from '@/managers/front-end'
import type { FieldOption, OptionMark as OptionMarkKind } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface MultiSelectProps {
  id: string
  options: FieldOption[]
  value: string[]
  onChange: (value: string[]) => void
  emptyLabel: string
  mark?: OptionMarkKind
  maxItems?: number
}

/**
 * Scrollable checkbox list standing in for a native multiple select
 * @param {string} id - Identifier of the group
 * @param {FieldOption[]} options - Selectable options
 * @param {string[]} value - Selected values
 * @param {(value: string[]) => void} onChange - Selection handler
 * @param {string} emptyLabel - Shown when no option exists yet
 * @param {OptionMarkKind} [mark] - Glyph drawn beside every option
 * @param {number} [maxItems] - Most entries allowed
 * @return {JSX.Element}
 */

export const MultiSelect = ({
  id,
  options,
  value,
  onChange,
  emptyLabel,
  mark,
  maxItems,
}: MultiSelectProps) => {
  const { showHint } = useHints()

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
      className="flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1"
    >
      {options.map((option) => (
        <span
          key={option.value}
          className={cn(
            'flex min-w-0 items-center gap-2',
            option.disabled && 'cursor-not-allowed opacity-50'
          )}
          // Runs before the checkbox's own click, so a disabled option never toggles
          onClickCapture={(event: MouseEvent<HTMLSpanElement>) => {
            if (!option.disabled) return

            event.preventDefault()
            event.stopPropagation()
            if (option.hint)
              showHint(option.hint, { x: event.clientX, y: event.clientY }, ICONS.blocked)
          }}
        >
          {mark && (
            <span className="pl-2">
              <OptionMark mark={mark} option={option} />
            </span>
          )}
          <Checkbox
            checked={value.includes(option.value)}
            onChange={() => toggle(option)}
            label={option.label}
            hint={option.hint}
            className="min-w-0 flex-1"
          />
        </span>
      ))}
    </div>
  )
}
