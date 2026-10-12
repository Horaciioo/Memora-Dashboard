'use client'

import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import type { CalendarRailView } from '@/core/hooks/interaction/useCalendarRailView'
import { cn } from '@/utils/classnames'

export interface CalendarRailSwitchProps {
  value: CalendarRailView
  onChange: (value: CalendarRailView) => void
}

// Buttons in order
const VIEWS: { value: CalendarRailView; label: string }[] = [
  { value: 'calendar', label: NAV_COPY.railViewCalendarShort },
  { value: 'classic', label: NAV_COPY.railViewClassicShort },
]

/**
 * Two buttons choosing the menu beside the calendar: the calendar menu or the classic one
 * @param {CalendarRailView} value - Menu in force
 * @param {(value: CalendarRailView) => void} onChange - Choice handler
 * @return {JSX.Element}
 */

export const CalendarRailSwitch = ({ value, onChange }: CalendarRailSwitchProps) => (
  <div role="group" aria-label={NAV_COPY.railViewSwitch} className={LEFT_SIDEBAR.viewButtons}>
    {VIEWS.map((view) => (
      <button
        key={view.value}
        type="button"
        aria-pressed={view.value === value}
        onClick={() => onChange(view.value)}
        className={cn(
          LEFT_SIDEBAR.viewButton,
          view.value === value && LEFT_SIDEBAR.viewButtonActive
        )}
      >
        {view.label}
      </button>
    ))}
  </div>
)
