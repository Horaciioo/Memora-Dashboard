'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { PLAY_PREF } from '@/declarations/ui/variants'

export interface PlayPrefRowProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * One setting: its name and hint, the switch on the right
 * @param {PlayPrefRowProps} props - Name, hint and switch
 * @return {JSX.Element}
 */

export const PlayPrefRow = ({ label, hint, checked, onChange }: PlayPrefRowProps) => (
  <div className={PLAY_PREF.row}>
    <span className={PLAY_PREF.text}>
      <span className={PLAY_PREF.label}>{label}</span>
      {hint && <span className={PLAY_PREF.hint}>{hint}</span>}
    </span>
    <Toggle bare checked={checked} onChange={onChange} label={label} />
  </div>
)
