'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAnchoredPanel } from '@/core/hooks/interaction/useAnchoredPanel'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DATE_PICKER_STYLES, SELECT_MENU_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { monthGrid, periodLabel, shiftAnchor, toDayKey } from '@/utils/format/calendar'
import { formatDay, formatDayRange, formatDayTime } from '@/utils/format/dates'

export interface DatePickerProps {
  id?: string
  // ISO day (or ISO minute with withTime); a two-day tuple with range
  value: string | string[]
  onChange: (value: string | string[]) => void
  label: string
  withTime?: boolean
  // Picks two ordered days, by drag or two clicks
  range?: boolean
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

// Time of day a datetime lands on when the day is picked first
const DEFAULT_TIME = '09:00'

/**
 * Split a stored value into its day and its time
 * @param {string} value - ISO day or ISO minute
 * @return {{ day: string, time: string }} - Both halves
 */

const splitValue = (value: string): { day: string; time: string } => {
  const [day = '', time = ''] = value.split('T')

  return { day, time: time.slice(0, 5) }
}

/**
 * Order two ISO days
 * @param {string} a - One day
 * @param {string} b - Other day
 * @return {[string, string]} - Earliest first
 */

const orderedRange = (a: string, b: string): [string, string] => (a <= b ? [a, b] : [b, a])

/**
 * Drawn calendar replacing the native date input, gaining a time field on a datetime field
 * or a two-day selection with range
 * @param {string} [id] - Identifier of the trigger
 * @param {string | string[]} value - ISO day, ISO minute, or a two-day tuple
 * @param {(value: string | string[]) => void} onChange - Value handler
 * @param {string} label - Accessible name of the control
 * @param {boolean} [withTime] - Adds the time field under the grid
 * @param {boolean} [range] - Picks a start and an end day
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection border
 * @param {string} [describedBy] - Identifier of the message describing the control
 * @return {JSX.Element}
 */

export const DatePicker = ({
  id,
  value,
  onChange,
  label,
  withTime,
  range,
  disabled,
  invalid,
  describedBy,
}: DatePickerProps) => {
  const single = typeof value === 'string' ? value : ''
  const [rangeStart = '', rangeEnd = ''] = Array.isArray(value) ? value : []
  const { day, time } = splitValue(single)

  const { isOpen, setOpen, close, triggerRef, panelRef } = useAnchoredPanel()
  const [cursor, setCursor] = useState(() => day || rangeStart || toDayKey(new Date()))
  const [anchor, setAnchor] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const CalendarIcon = ICONS.meetings
  const PreviousIcon = ICONS.back
  const NextIcon = ICONS.forward

  const days = useMemo(() => monthGrid(cursor), [cursor])

  // Reopening always lands on the month of the current value
  const open = () => {
    if (disabled) return

    setCursor(day || rangeStart || toDayKey(new Date()))
    setAnchor(null)
    setPreview(null)
    setOpen(true)
  }

  const pick = (nextDay: string) => {
    if (!withTime) {
      onChange(nextDay)
      close()
      return
    }

    // A datetime keeps the time already chosen, or opens the working day
    onChange(`${nextDay}T${time || DEFAULT_TIME}`)
  }

  // Commit a range and dismiss the panel
  const commitRange = useCallback(
    (a: string, b: string) => {
      onChange(orderedRange(a, b))
      setAnchor(null)
      setPreview(null)
      close()
    },
    [onChange, close]
  )

  // One step of a range: set the anchor, then close it on the next day
  const stepRange = (nextDay: string) => {
    if (anchor === null) {
      setAnchor(nextDay)
      setPreview(nextDay)
      onChange([])
      return
    }

    commitRange(anchor, nextDay)
  }

  // A drag across days commits on release; a plain click waits for the second click
  useEffect(() => {
    if (!isOpen || !range) return

    const onUp = () => {
      if (anchor !== null && preview !== null && preview !== anchor) commitRange(anchor, preview)
    }

    window.addEventListener('pointerup', onUp)

    return () => window.removeEventListener('pointerup', onUp)
  }, [isOpen, range, anchor, preview, commitRange])

  // Highlighted span, the live drag winning over the committed pair
  const activeRange =
    range && anchor !== null && preview !== null
      ? orderedRange(anchor, preview)
      : range && rangeStart && rangeEnd
        ? ([rangeStart, rangeEnd] as [string, string])
        : null

  const triggerLabel = range
    ? rangeStart && rangeEnd
      ? formatDayRange(rangeStart, rangeEnd)
      : null
    : day
      ? withTime
        ? formatDayTime(single)
        : formatDay(day)
      : null

  return (
    <>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label}
        aria-describedby={describedBy}
        onClick={() => (isOpen ? setOpen(false) : open())}
        className={cn(
          SELECT_MENU_STYLES.trigger,
          SELECT_MENU_STYLES.triggerBlock,
          invalid && SELECT_MENU_STYLES.invalid
        )}
      >
        <CalendarIcon className={SELECT_MENU_STYLES.chevron} aria-hidden="true" />
        <span className={SELECT_MENU_STYLES.value}>
          {triggerLabel ? (
            <span className={SELECT_MENU_STYLES.optionLabel}>{triggerLabel}</span>
          ) : (
            <span className={SELECT_MENU_STYLES.placeholder}>
              {range ? PICKER_COPY.chooseRange : PICKER_COPY.chooseDay}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[65]" role="presentation" onMouseDown={close} />
          <div ref={panelRef} role="dialog" aria-label={label} className={DATE_PICKER_STYLES.panel}>
            <div className={DATE_PICKER_STYLES.head}>
              <button
                type="button"
                aria-label={PICKER_COPY.previousMonth}
                className={DATE_PICKER_STYLES.step}
                onClick={() => setCursor(shiftAnchor(cursor, 'month', -1))}
              >
                <PreviousIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className={DATE_PICKER_STYLES.month}>{periodLabel(cursor, 'month')}</span>
              <button
                type="button"
                aria-label={PICKER_COPY.nextMonth}
                className={DATE_PICKER_STYLES.step}
                onClick={() => setCursor(shiftAnchor(cursor, 'month', 1))}
              >
                <NextIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className={DATE_PICKER_STYLES.weekdays}>
              {WEEKDAY_LABELS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className={cn(DATE_PICKER_STYLES.grid, range && 'select-none')}>
              {days.map((entry) => {
                const within =
                  activeRange !== null && entry.key >= activeRange[0] && entry.key <= activeRange[1]
                const edgeStart = activeRange !== null && entry.key === activeRange[0]
                const edgeEnd = activeRange !== null && entry.key === activeRange[1]

                return (
                  <button
                    key={entry.key}
                    type="button"
                    aria-pressed={range ? within : entry.key === day}
                    className={cn(
                      DATE_PICKER_STYLES.day,
                      !entry.isCurrentMonth && DATE_PICKER_STYLES.dayOutside,
                      entry.isToday && DATE_PICKER_STYLES.dayToday,
                      !range && entry.key === day && DATE_PICKER_STYLES.daySelected,
                      within && !edgeStart && !edgeEnd && DATE_PICKER_STYLES.dayInRange,
                      (edgeStart || edgeEnd) && DATE_PICKER_STYLES.daySelected,
                      edgeStart && !edgeEnd && DATE_PICKER_STYLES.dayRangeStart,
                      edgeEnd && !edgeStart && DATE_PICKER_STYLES.dayRangeEnd
                    )}
                    onClick={range ? undefined : () => pick(entry.key)}
                    onPointerDown={range ? () => stepRange(entry.key) : undefined}
                    onPointerEnter={
                      range && anchor !== null ? () => setPreview(entry.key) : undefined
                    }
                    onKeyDown={
                      range
                        ? (event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return

                            event.preventDefault()
                            stepRange(entry.key)
                          }
                        : undefined
                    }
                  >
                    {entry.dayOfMonth}
                  </button>
                )
              })}
            </div>

            <div className={DATE_PICKER_STYLES.footer}>
              {range && (
                <span className="text-xs text-[var(--color-ink-subtle)]">
                  {PICKER_COPY.rangeHint}
                </span>
              )}
              {withTime && !range && (
                <input
                  type="time"
                  value={time}
                  aria-label={PICKER_COPY.time}
                  className={DATE_PICKER_STYLES.time}
                  onChange={(event) =>
                    onChange(`${day || toDayKey(new Date())}T${event.target.value}`)
                  }
                />
              )}
              {!range && (
                <button
                  type="button"
                  className={cn(DATE_PICKER_STYLES.step, 'ml-auto w-auto px-2 text-xs')}
                  onClick={() => pick(toDayKey(new Date()))}
                >
                  {PICKER_COPY.today}
                </button>
              )}
              <button
                type="button"
                className={cn(DATE_PICKER_STYLES.step, 'w-auto px-2 text-xs', range && 'ml-auto')}
                onClick={() => {
                  onChange(range ? [] : '')
                  setAnchor(null)
                  setPreview(null)
                  close()
                }}
              >
                {PICKER_COPY.clear}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
