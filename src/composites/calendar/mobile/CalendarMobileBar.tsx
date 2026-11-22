'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { CalendarSidebar, type CalendarSidebarProps } from '@/composites/calendar/CalendarSidebar'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ICONS } from '@/declarations/ui/icons'
import { CALENDAR_MOBILE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { CalendarUnit } from '@/utils/format/calendar'

export interface CalendarMobileBarProps {
  title: string
  unit: CalendarUnit
  // Views in the order the list shows them
  units: { value: CalendarUnit; label: string }[]
  onUnit: (unit: CalendarUnit) => void
  isLoading: boolean
  // Filters sheet, absent on a calendar bound to a session
  railProps?: CalendarSidebarProps
  // Control only some members get, laid before the filters
  extra?: ReactNode
}

/**
 * Header of the calendar on a phone: the period with its views and the filters
 * @param {CalendarMobileBarProps} props - Header state
 * @return {JSX.Element}
 */

export const CalendarMobileBar = ({
  title,
  unit,
  units,
  onUnit,
  isLoading,
  railProps,
  extra,
}: CalendarMobileBarProps) => {
  const [isOpen, setOpen] = useState(false)
  const CaretIcon = ICONS.expand

  return (
    <div className={CALENDAR_MOBILE.bar}>
      <div className={CALENDAR_MOBILE.row}>
        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={CALENDAR_COPY.viewsTitle}
            onClick={() => setOpen((open) => !open)}
            className={CALENDAR_MOBILE.title}
          >
            <span className="truncate">{title}</span>
            <CaretIcon
              className={cn(CALENDAR_MOBILE.caret, isOpen && CALENDAR_MOBILE.caretOpen)}
              aria-hidden="true"
            />
          </button>

          {isOpen && (
            <>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className={CALENDAR_MOBILE.scrim}
                onClick={() => setOpen(false)}
              />
              <div role="menu" className={CALENDAR_MOBILE.views}>
                {units.map((entry) => (
                  <button
                    key={entry.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={entry.value === unit}
                    onClick={() => {
                      onUnit(entry.value)
                      setOpen(false)
                    }}
                    className={cn(
                      CALENDAR_MOBILE.view,
                      entry.value === unit && CALENDAR_MOBILE.viewActive
                    )}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {isLoading && <BrandLoader variant="ink" />}
        {extra}
        {railProps && <CalendarSidebar {...railProps} />}
      </div>
    </div>
  )
}
