'use client'

import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'

export type RailSection = 'private' | 'normal'

export interface RailSectionSwitchProps {
  value: RailSection
  onChange: (value: RailSection) => void
}

// Buttons in order
const SECTIONS: { value: RailSection; label: string }[] = [
  { value: 'private', label: NAV_COPY.railSectionPrivate },
  { value: 'normal', label: NAV_COPY.railSectionNormal },
]

/**
 * Two tabs choosing the rail pages: private or normal
 * @param {RailSection} value - Section shown
 * @param {(value: RailSection) => void} onChange - Choice handler
 * @return {JSX.Element}
 */

export const RailSectionSwitch = ({ value, onChange }: RailSectionSwitchProps) => (
  <div role="group" aria-label={NAV_COPY.railSectionSwitch} className={LEFT_SIDEBAR.viewButtons}>
    {SECTIONS.map((section) => (
      <button
        key={section.value}
        type="button"
        aria-pressed={section.value === value}
        onClick={() => onChange(section.value)}
        className={cn(
          LEFT_SIDEBAR.viewButton,
          section.value === value && LEFT_SIDEBAR.viewButtonActive
        )}
      >
        {section.label}
      </button>
    ))}
  </div>
)
