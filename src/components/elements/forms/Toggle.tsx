'use client'

import { TOGGLE_STYLES, TRI_TOGGLE_STYLES } from '@/declarations/ui/variants'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'
import type { PermissionState } from '@/core/lib/permissions'

export interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  // Drops the framed row and the visible label
  bare?: boolean
  // Track paints green/red and the knob carries a check/cross
  binary?: boolean
}

/**
 * Switch carrying its own label
 * @param {string} [id] - Identifier of the control
 * @param {boolean} checked - Current state
 * @param {(checked: boolean) => void} onChange - State handler
 * @param {string} label - Visible label
 * @param {boolean} [disabled] - Blocks interaction
 * @param {boolean} [bare] - Switch alone
 * @param {boolean} [binary] - Track paints green/red
 * @return {JSX.Element}
 */

export const Toggle = ({ id, checked, onChange, label, disabled, bare, binary }: ToggleProps) => {
  const CheckIcon = ICONS.confirm
  const CrossIcon = ICONS.close

  // One track tone per state
  const onTone = binary ? TOGGLE_STYLES.trackSuccess : TOGGLE_STYLES.trackOn
  const offTone = binary ? TOGGLE_STYLES.trackDanger : TOGGLE_STYLES.trackOff
  const trackTone = checked ? onTone : offTone

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={bare ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        bare ? 'inline-flex shrink-0' : TOGGLE_STYLES.row,
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      <span className={cn(TOGGLE_STYLES.track, trackTone)}>
        <span
          className={cn(TOGGLE_STYLES.knob, checked ? TOGGLE_STYLES.knobOn : TOGGLE_STYLES.knobOff)}
        >
          {binary &&
            (checked ? (
              <CheckIcon
                className={cn(TOGGLE_STYLES.knobGlyph, 'text-[var(--color-success)]')}
                aria-hidden="true"
              />
            ) : (
              <CrossIcon
                className={cn(TOGGLE_STYLES.knobGlyph, 'text-[var(--color-danger)]')}
                aria-hidden="true"
              />
            ))}
        </span>
      </span>
      {!bare && <span className="text-left">{label}</span>}
    </button>
  )
}

export interface CheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
  className?: string
}

/**
 * Checkbox row used inside permission and selection lists
 * @param {string} [id] - Identifier of the control
 * @param {boolean} checked - Current state
 * @param {(checked: boolean) => void} onChange - State handler
 * @param {string} label - Visible label
 * @param {string} [hint] - Secondary line below the label
 * @param {boolean} [disabled] - Blocks interaction
 * @param {string} [className] - Extra classes merged onto the row
 * @return {JSX.Element}
 */

export const Checkbox = ({
  id,
  checked,
  onChange,
  label,
  hint,
  disabled,
  className,
}: CheckboxProps) => {
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
        disabled && 'opacity-50',
        className
      )}
    >
      <span
        className={cn(
          TOGGLE_STYLES.checkbox,
          checked ? TOGGLE_STYLES.checkboxOn : TOGGLE_STYLES.checkboxOff,
          'mt-0.5'
        )}
      >
        {checked && <CheckIcon className="h-3 w-3" aria-hidden="true" />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm">{label}</span>
        {hint && <span className="text-xs text-[var(--color-ink-subtle)]">{hint}</span>}
      </span>
    </button>
  )
}

// One slot per state
const TRI_SLOTS = [
  {
    value: 'denied',
    icon: 'close',
    tone: TRI_TOGGLE_STYLES.denied,
    label: ACCESS_COPY.stateDenied,
  },
  {
    value: 'inherited',
    icon: 'inherit',
    tone: TRI_TOGGLE_STYLES.inherited,
    label: ACCESS_COPY.stateInherited,
  },
  {
    value: 'allowed',
    icon: 'confirm',
    tone: TRI_TOGGLE_STYLES.allowed,
    label: ACCESS_COPY.stateAllowed,
  },
] as const

export interface TriToggleProps {
  value: PermissionState
  onChange: (next: PermissionState) => void
  label: string
  disabled?: boolean
}

/**
 * Three-state switch
 * @param {PermissionState} value - Current state
 * @param {(next: PermissionState) => void} onChange - State handler
 * @param {string} label - Accessible name of the group
 * @param {boolean} [disabled] - Blocks interaction
 * @return {JSX.Element}
 */

export const TriToggle = ({ value, onChange, label, disabled }: TriToggleProps) => (
  <span
    role="radiogroup"
    aria-label={label}
    className={cn(TRI_TOGGLE_STYLES.group, disabled && TRI_TOGGLE_STYLES.disabled)}
  >
    {TRI_SLOTS.map((slot) => {
      const Glyph = ICONS[slot.icon]
      const isOn = value === slot.value

      return (
        <button
          key={slot.value}
          type="button"
          role="radio"
          aria-checked={isOn}
          aria-label={slot.label}
          title={slot.label}
          disabled={disabled}
          onClick={() => onChange(slot.value)}
          className={cn(TRI_TOGGLE_STYLES.slot, isOn ? slot.tone : TRI_TOGGLE_STYLES.slotIdle)}
        >
          <Glyph className={TRI_TOGGLE_STYLES.glyph} aria-hidden="true" />
        </button>
      )
    })}
  </span>
)
