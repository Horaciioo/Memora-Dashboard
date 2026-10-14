'use client'

import { ICONS } from '@/declarations/ui/icons'
import { CANDIDATE_FILE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ObserveCheckProps {
  joined: boolean
  label: string
  disabled?: boolean
  onChange: (joined: boolean) => void
}

/**
 * Bare check an observer ticks to sit in on an interview
 * @param {boolean} joined - Already sitting in
 * @param {string} label - Text beside the check
 * @param {boolean} [disabled] - Blocks the check
 * @param {(joined: boolean) => void} onChange - Called with the wanted state
 * @return {JSX.Element}
 */

export const ObserveCheck = ({ joined, label, disabled, onChange }: ObserveCheckProps) => {
  const Check = ICONS.check

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={joined}
      disabled={disabled}
      onClick={() => onChange(!joined)}
      className={cn(
        CANDIDATE_FILE.observe,
        joined ? CANDIDATE_FILE.observeOn : CANDIDATE_FILE.observeOff
      )}
    >
      <Check
        className={cn(CANDIDATE_FILE.observeGlyph, !joined && 'opacity-40')}
        aria-hidden="true"
      />
      {label}
    </button>
  )
}
