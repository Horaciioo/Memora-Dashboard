'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DATE_PICKER_STYLES, SELECT_MENU_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { monthGrid, periodLabel, shiftAnchor, toDayKey } from '@/utils/format/calendar'
import { formatDay, formatDayTime } from '@/utils/format/dates'

export interface DatePickerProps {
  id?: string
  // ISO day, or ISO minute once withTime is on
  value: string
  onChange: (value: string) => void
  label: string
  withTime?: boolean
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

// Room kept between the panel and the viewport edge
const EDGE_MARGIN = 8

// Gap between the trigger and its panel
const PANEL_GAP = 4

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
 * Drawn calendar replacing the native date input, gaining a time field on a datetime field
 * @param {string} [id] - Identifier of the trigger
 * @param {string} value - ISO day, or ISO minute when withTime is on
 * @param {(value: string) => void} onChange - Value handler
 * @param {string} label - Accessible name of the control
 * @param {boolean} [withTime] - Adds the time field under the grid
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
  disabled,
  invalid,
  describedBy,
}: DatePickerProps) => {
  const { day, time } = splitValue(value)
  const [isOpen, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() => day || toDayKey(new Date()))
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const CalendarIcon = ICONS.meetings
  const PreviousIcon = ICONS.back
  const NextIcon = ICONS.forward

  const days = useMemo(() => monthGrid(cursor), [cursor])

  // Reopening always lands on the month of the current value
  const open = () => {
    if (disabled) return

    setCursor(day || toDayKey(new Date()))
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
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

  // Anchor the panel under the trigger, flipping it above when it would overflow
  useLayoutEffect(() => {
    if (!isOpen) return

    const trigger = triggerRef.current?.getBoundingClientRect()
    const panel = panelRef.current
    if (!trigger || !panel) return

    const height = panel.offsetHeight
    const room = window.innerHeight - trigger.bottom - EDGE_MARGIN
    const flip = height > room && trigger.top > room

    panel.style.left = `${Math.max(EDGE_MARGIN, Math.min(trigger.left, window.innerWidth - panel.offsetWidth - EDGE_MARGIN))}px`
    panel.style.top = flip
      ? `${Math.max(EDGE_MARGIN, trigger.top - height - PANEL_GAP)}px`
      : `${trigger.bottom + PANEL_GAP}px`
  }, [isOpen, cursor])

  // A scroll or a resize moves the trigger out from under its panel
  useEffect(() => {
    if (!isOpen) return

    const dismiss = () => setOpen(false)

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      // An overlay behind the calendar listens for escape too
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }

    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)
    document.addEventListener('keydown', onEscape, true)

    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
      document.removeEventListener('keydown', onEscape, true)
    }
  }, [isOpen])

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
          {day ? (
            <span className={SELECT_MENU_STYLES.optionLabel}>
              {withTime ? formatDayTime(value) : formatDay(day)}
            </span>
          ) : (
            <span className={SELECT_MENU_STYLES.placeholder}>{PICKER_COPY.chooseDay}</span>
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

            <div className={DATE_PICKER_STYLES.grid}>
              {days.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  aria-pressed={entry.key === day}
                  className={cn(
                    DATE_PICKER_STYLES.day,
                    !entry.isCurrentMonth && DATE_PICKER_STYLES.dayOutside,
                    entry.isToday && DATE_PICKER_STYLES.dayToday,
                    entry.key === day && DATE_PICKER_STYLES.daySelected
                  )}
                  onClick={() => pick(entry.key)}
                >
                  {entry.dayOfMonth}
                </button>
              ))}
            </div>

            <div className={DATE_PICKER_STYLES.footer}>
              {withTime && (
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
              <button
                type="button"
                className={cn(DATE_PICKER_STYLES.step, 'ml-auto w-auto px-2 text-xs')}
                onClick={() => pick(toDayKey(new Date()))}
              >
                {PICKER_COPY.today}
              </button>
              <button
                type="button"
                className={cn(DATE_PICKER_STYLES.step, 'w-auto px-2 text-xs')}
                onClick={() => {
                  onChange('')
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
