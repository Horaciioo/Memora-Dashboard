'use client'

import { useState } from 'react'
import { DateWheel } from '@/components/elements/forms/date/DateWheel'
import { DayGrid } from '@/components/elements/forms/date/DayGrid'
import { useRangePick } from '@/components/elements/forms/date/useRangePick'
import { FloatingLayer } from '@/components/structures/FloatingLayer'
import { useAnchoredPanel } from '@/core/hooks/interaction/useAnchoredPanel'
import { useIsMobileShell } from '@/core/hooks/interaction/useBreakpoint'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import {
  DATE_PICKER_STYLES,
  SELECT_MENU_SIZES,
  SELECT_MENU_STYLES,
} from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { toDayKey } from '@/utils/format/calendar'
import { formatDay, formatDayRange, formatDayTime } from '@/utils/format/dates'

export interface DatePickerProps {
  id?: string
  // ISO day (or ISO minute with withTime); a two-day tuple with range
  value: string | string[]
  onChange: (value: string | string[]) => void
  label: string
  withTime?: boolean
  // Picks two ordered days
  range?: boolean
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

// Time of day a datetime lands on when the day is picked first
const DEFAULT_TIME = '09:00'

/**
 * Drawn calendar, or iOS wheels on mobile, replacing the native date input
 * @param {DatePickerProps} props - Value, handler and flags
 * @return {JSX.Element}
 */

export const DatePicker = ({
  id,
  value,
  onChange,
  label,
  withTime,
  range = false,
  disabled,
  invalid,
  describedBy,
}: DatePickerProps) => {
  const single = typeof value === 'string' ? value : ''
  const [rangeStart = '', rangeEnd = ''] = Array.isArray(value) ? value : []
  const [day = '', clock = ''] = single.split('T')
  const time = clock.slice(0, 5)

  const { isOpen, setOpen, close, triggerRef, panelRef } = useAnchoredPanel()
  const [cursor, setCursor] = useState(() => day || rangeStart || toDayKey(new Date()))
  const isWheel = useIsMobileShell() && !range

  const picking = useRangePick({
    isOpen,
    enabled: range,
    committed: rangeStart && rangeEnd ? [rangeStart, rangeEnd] : null,
    onCommit: (next) => {
      onChange(next)
      close()
    },
  })

  const CalendarIcon = ICONS.meetings

  // Reopening lands on the month of the current value
  const open = () => {
    if (disabled) return

    setCursor(day || rangeStart || toDayKey(new Date()))
    picking.reset()
    setOpen(true)
  }

  // A datetime keeps the time already chosen
  const pick = (nextDay: string) => {
    if (withTime) return onChange(`${nextDay}T${time || DEFAULT_TIME}`)

    onChange(nextDay)
    if (!isWheel) close()
  }

  const clear = () => {
    onChange(range ? [] : '')
    picking.reset()
    close()
  }

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
          SELECT_MENU_SIZES.block.trigger,
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
        <FloatingLayer>
          <div className={SELECT_MENU_STYLES.scrim} role="presentation" onMouseDown={close} />
          <div ref={panelRef} role="dialog" aria-label={label} className={DATE_PICKER_STYLES.panel}>
            {isWheel ? (
              <DateWheel value={day || toDayKey(new Date())} onChange={pick} />
            ) : (
              <DayGrid
                cursor={cursor}
                onCursor={setCursor}
                day={day}
                span={picking.span}
                range={range}
                isAnchored={picking.isAnchored}
                onHover={picking.hover}
                onPick={range ? (next) => picking.step(next) && onChange([]) : pick}
              />
            )}

            <div className={DATE_PICKER_STYLES.footer}>
              {range && <span className={DATE_PICKER_STYLES.hint}>{PICKER_COPY.rangeHint}</span>}
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
                  className={cn(DATE_PICKER_STYLES.action, 'ml-auto')}
                  onClick={() => pick(toDayKey(new Date()))}
                >
                  {PICKER_COPY.today}
                </button>
              )}
              <button
                type="button"
                className={cn(DATE_PICKER_STYLES.action, range && 'ml-auto')}
                onClick={clear}
              >
                {PICKER_COPY.clear}
              </button>
            </div>
          </div>
        </FloatingLayer>
      )}
    </>
  )
}
