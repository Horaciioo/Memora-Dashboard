'use client'

import { TOGGLE_STYLES } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

/**
 * Switch carrying its own label, used for a single yes/no setting
 * @param {string} [id] - Identifier of the control
 * @param {boolean} checked - Current state
 * @param {(checked: boolean) => void} onChange - State handler
 * @param {string} label - Visible label
 * @param {boolean} [disabled] - Blocks interaction
 * @return {JSX.Element}
 */

export const Toggle = ({ id, checked, onChange, label, disabled }: ToggleProps) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(TOGGLE_STYLES.row, disabled && 'opacity-60')}
  >
    <span className={cn(TOGGLE_STYLES.track, checked && TOGGLE_STYLES.trackOn)}>
      <span className={cn(TOGGLE_STYLES.knob, checked && TOGGLE_STYLES.knobOn)} />
    </span>
    <span className="text-left">{label}</span>
  </button>
)

export interface CheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
}

/**
 * Checkbox row used inside permission and selection lists
 * @param {string} [id] - Identifier of the control
 * @param {boolean} checked - Current state
 * @param {(checked: boolean) => void} onChange - State handler
 * @param {string} label - Visible label
 * @param {string} [hint] - Secondary line below the label
 * @param {boolean} [disabled] - Blocks interaction
 * @return {JSX.Element}
 */

export const Checkbox = ({ id, checked, onChange, label, hint, disabled }: CheckboxProps) => {
  const CheckIcon = ICONS.confirm

  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-surface)]',
        disabled && 'opacity-50'
      )}
    >
      <span className={cn(TOGGLE_STYLES.checkbox, checked && TOGGLE_STYLES.checkboxOn, 'mt-0.5')}>
        {checked && <CheckIcon className="h-3 w-3" aria-hidden="true" />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm">{label}</span>
        {hint && <span className="text-xs text-[var(--color-ink-subtle)]">{hint}</span>}
      </span>
    </button>
  )
}
