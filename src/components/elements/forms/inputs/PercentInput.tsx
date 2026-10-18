'use client'

import { useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Input } from '@/components/elements/forms/inputs/Input'
import { PERCENT_INPUT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PercentInputProps {
  value: number
  max: number
  label: string
  disabled?: boolean
  onCommit: (value: number) => void
}

/**
 * Percentage typed in place, green from the half
 * @param {number} value - Current percentage
 * @param {number} max - Highest percentage
 * @param {string} label - Accessible name
 * @param {boolean} [disabled] - Blocks the field
 * @param {(value: number) => void} onCommit - Called with the settled value
 * @return {JSX.Element}
 */

export const PercentInput = ({ value, max, label, disabled, onCommit }: PercentInputProps) => {
  // What is typed, none while the stored value shows
  const [draft, setDraft] = useState<string | null>(null)

  const settle = () => {
    if (draft === null) return

    const typed = Math.round(Number(draft))
    const next = Number.isNaN(typed) ? value : Math.min(Math.max(typed, 0), max)
    setDraft(null)
    if (next !== value) onCommit(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur()
    if (event.key === 'Escape') {
      setDraft(null)
      event.currentTarget.blur()
    }
  }

  return (
    <span className={PERCENT_INPUT.root}>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        step={1}
        aria-label={label}
        disabled={disabled}
        value={draft ?? String(value)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={settle}
        onKeyDown={onKeyDown}
        className={cn(
          PERCENT_INPUT.control,
          value * 2 >= max ? PERCENT_INPUT.high : PERCENT_INPUT.low
        )}
      />
      <span className={PERCENT_INPUT.unit} aria-hidden="true">
        %
      </span>
    </span>
  )
}
