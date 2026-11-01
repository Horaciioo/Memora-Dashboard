'use client'

import { GRANTABLE_LEVELS, PAGE_LEVELS } from '@/declarations/pages/access'
import type { GrantableLevelName } from '@/declarations/pages/access'
import { PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import { SHARE_PANEL_STYLES } from '@/declarations/ui/variants'

export interface LevelSelectProps {
  value: GrantableLevelName
  // Levels above this one stay out
  ceiling: number
  disabled?: boolean
  onChange: (level: GrantableLevelName) => void
  onRemove?: () => void
}

// Remove sentinel among the options
const REMOVE = 'remove'

/**
 * Level picker of one share, removal at the bottom
 * @param {LevelSelectProps} props - Level, bound and handlers
 * @return {JSX.Element}
 */

export const LevelSelect = ({ value, ceiling, disabled, onChange, onRemove }: LevelSelectProps) => (
  <select
    aria-label={PAGE_SHARE_COPY.levelLabel}
    className={SHARE_PANEL_STYLES.level}
    value={value}
    disabled={disabled}
    onChange={(event) => {
      if (event.target.value === REMOVE) return onRemove?.()
      onChange(event.target.value as GrantableLevelName)
    }}
  >
    {GRANTABLE_LEVELS.filter((level) => PAGE_LEVELS.get(level).rank <= ceiling).map((level) => (
      <option key={level} value={level}>
        {PAGE_LEVELS.get(level).label}
      </option>
    ))}
    {onRemove && <option value={REMOVE}>{PAGE_SHARE_COPY.remove}</option>}
  </select>
)
