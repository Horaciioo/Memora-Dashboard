'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Value of the whole team
export const EVERYONE = ''

export interface ModeratorOption {
  key: string
  name: string
  avatar: string | null
}

export interface ModeratorPickerProps {
  options: ModeratorOption[]
  value: string
  onChange: (key: string) => void
}

/**
 * Chips to look at the whole team or at one moderator
 * @param {ModeratorOption[]} options - Moderators
 * @param {string} value - Picked key, empty for everyone
 * @param {(key: string) => void} onChange - Pick handler
 * @return {JSX.Element}
 */

export const ModeratorPicker = ({ options, value, onChange }: ModeratorPickerProps) => (
  <div className={LIVE_REPORT.picker} role="radiogroup" aria-label={BILAN_COPY.pickLabel}>
    {[{ key: EVERYONE, name: BILAN_COPY.pickEveryone, avatar: null }, ...options].map((option) => (
      <button
        key={option.key}
        type="button"
        role="radio"
        aria-checked={value === option.key}
        className={cn(LIVE_REPORT.pick, value === option.key && LIVE_REPORT.pickOn)}
        onClick={() => onChange(option.key)}
      >
        {option.key !== EVERYONE && <Avatar name={option.name} src={option.avatar} size="xs" />}
        {option.name}
      </button>
    ))}
  </div>
)
