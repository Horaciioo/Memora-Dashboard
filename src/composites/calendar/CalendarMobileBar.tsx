'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { CalendarSidebar, type CalendarSidebarProps } from '@/composites/calendar/CalendarSidebar'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ICONS } from '@/declarations/ui/icons'
import { CALENDAR_MOBILE } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'
import type { CalendarUnit } from '@/utils/format/calendar'

// Every creator at once
const ALL_CREATORS = 'all'

// Months the strip offers
const STRIP_MONTHS = 12

export interface CalendarMobileBarProps {
  title: string
  unit: CalendarUnit
  // Views in the order the list shows them
  units: { value: CalendarUnit; label: string }[]
  onUnit: (unit: CalendarUnit) => void
  // ISO day on screen
  cursor: string
  onCursor: (dayKey: string) => void
  onToday: () => void
  isLoading: boolean
  youtubers: FieldOption[]
  // Only creator left on, empty for every one
  soloId: string
  onSolo: (creatorId: string) => void
  // Filters sheet, absent on a calendar bound to a session
  railProps?: CalendarSidebarProps
  // Control only some members get, laid before the filters
  extra?: ReactNode
}

/**
 * One strip entry
 * @typedef {Object} StripEntry
 * @property {string} key - ISO first day of the month
 * @property {string} label - Short month name
 * @property {boolean} [year] - A year marker, not a month
 */

interface StripEntry {
  key: string
  label: string
  year?: boolean
}

/**
 * Months starting at the one on screen, the year named where it turns
 * @param {string} cursor - ISO day on screen
 * @return {StripEntry[]} - Entries
 */

const monthStrip = (cursor: string): StripEntry[] => {
  const [year, month] = cursor.split('-').map(Number)

  return Array.from({ length: STRIP_MONTHS }, (_, index) => {
    const day = new Date(Date.UTC(year, month - 1 + index, 1))
    const key = day.toISOString().slice(0, 10)
    const label = day.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' })
    const entries: StripEntry[] = [{ key, label }]

    return day.getUTCMonth() === 0 && index > 0
      ? [{ key: `year-${key}`, label: String(day.getUTCFullYear()), year: true }, ...entries]
      : entries
  }).flat()
}

/**
 * Header of the calendar on a phone: the period with its views, the months to jump to, today, the filters and the creator
 * @param {CalendarMobileBarProps} props - Header state
 * @return {JSX.Element}
 */

export const CalendarMobileBar = ({
  title,
  unit,
  units,
  onUnit,
  cursor,
  onCursor,
  onToday,
  isLoading,
  youtubers,
  soloId,
  onSolo,
  railProps,
  extra,
}: CalendarMobileBarProps) => {
  const [isOpen, setOpen] = useState(false)
  const CaretIcon = ICONS.expand

  const creators: FieldOption[] = [
    { value: ALL_CREATORS, label: CALENDAR_COPY.allCreators },
    ...youtubers,
  ]

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
        <button
          type="button"
          aria-label={CALENDAR_COPY.today}
          title={CALENDAR_COPY.today}
          onClick={onToday}
          className={CALENDAR_MOBILE.today}
        >
          {new Date().getDate()}
        </button>
        {youtubers.length > 0 && (
          <SelectMenu
            options={creators}
            value={soloId || ALL_CREATORS}
            onChange={(next) => onSolo(next === ALL_CREATORS ? '' : next)}
            label={CALENDAR_COPY.creatorPicker}
            mark="avatar"
            isMarkOnly
            className={CALENDAR_MOBILE.creator}
          />
        )}
      </div>

      {unit === 'month' && (
        <div className={CALENDAR_MOBILE.strip}>
          {monthStrip(cursor).map((entry, index) =>
            entry.year ? (
              <span key={entry.key} className={CALENDAR_MOBILE.year}>
                {entry.label}
              </span>
            ) : (
              <button
                key={entry.key}
                type="button"
                aria-current={index === 0 ? 'date' : undefined}
                onClick={() => onCursor(entry.key)}
                className={cn(CALENDAR_MOBILE.month, index === 0 && CALENDAR_MOBILE.monthActive)}
              >
                {entry.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
