'use client'

import { useState } from 'react'
import { DateWheel } from '@/components/elements/forms/date/DateWheel'
import { DayGrid } from '@/components/elements/forms/date/DayGrid'
import { useRangePick } from '@/components/elements/forms/date/useRangePick'
import { Tip } from '@/components/elements/feedback/Tip'
import { FloatingLayer } from '@/components/structures/overlays/FloatingLayer'
import { useAnchoredPanel } from '@/core/hooks/interaction/layout/useAnchoredPanel'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import {
  DATE_PICKER_STYLES,
  SELECT_MENU_SIZES,
  SELECT_MENU_STYLES,
} from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { periodLabel, toDayKey } from '@/utils/format/calendar'
import { formatDay, formatDayRange, formatWallDayTime } from '@/utils/format/dates'

export interface DatePickerProps {
  id?: string
  // ISO day (or ISO minute with withTime); a two-day tuple with range
  value: string | string[]
  onChange: (value: string | string[]) => void
  label: string
  // The value always carries an hour
  withTime?: boolean
  // The first pick carries an hour, the toggle can still drop it
  startsTimed?: boolean
  // The hour cannot be added
  dayOnly?: boolean
  // Picks two ordered days
  range?: boolean
  // Hours a timed range starts and ends on while none is chosen
  defaultTimes?: [string, string]
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  // Year the calendar opens on while empty
  startYear?: number
  // Earliest moment accepted, ISO day or minute
  min?: string
  // The hour is frozen off, the day alone counts
  hoursLocked?: boolean
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
  startsTimed,
  dayOnly,
  range = false,
  defaultTimes = [DEFAULT_TIME, DEFAULT_TIME],
  disabled,
  invalid,
  describedBy,
  startYear,
  min,
  hoursLocked,
}: DatePickerProps) => {
  const single = typeof value === 'string' ? value : ''
  const [rangeStart = '', rangeEnd = ''] = Array.isArray(value) ? value : []
  const [day = '', clock = ''] = single.split('T')
  const time = clock.slice(0, 5)

  // A timed range carries an hour on each end
  const [startDay = '', startStamp = ''] = rangeStart.split('T')
  const [endDay = '', endStamp = ''] = rangeEnd.split('T')
  const clocks = [
    startStamp.slice(0, 5) || defaultTimes[0],
    endStamp.slice(0, 5) || defaultTimes[1],
  ]

  // The hour shows once forced, once the value has one, or once asked for
  const [wantTime, setWantTime] = useState(Boolean(startsTimed))
  const hasValue = range ? startDay !== '' : day !== ''
  const timed =
    !hoursLocked &&
    (Boolean(withTime) || (hasValue ? (range ? startStamp : clock) !== '' : wantTime))
  const stamp = (target: string, clockValue: string, on = timed) =>
    on ? `${target}T${clockValue}` : target

  const { isOpen, setOpen, close, triggerRef, panelRef } = useAnchoredPanel()
  const firstDay = () =>
    day || startDay || (startYear ? `${startYear}-01-01` : toDayKey(new Date()))
  const [cursor, setCursor] = useState(firstDay)
  const [isPickingYear, setPickingYear] = useState(false)
  const isWheel = useIsMobileShell() && !range

  const picking = useRangePick({
    isOpen,
    enabled: range,
    committed: startDay && endDay ? [startDay, endDay] : null,
    onCommit: (next) => {
      onChange([stamp(next[0], clocks[0]), stamp(next[1], clocks[1])])
      if (!timed) close()
    },
  })

  const CalendarIcon = ICONS.meetings

  // Reopening lands on the month of the current value
  const open = () => {
    if (disabled) return

    setCursor(firstDay())
    setPickingYear(false)
    picking.reset()
    setOpen(true)
  }

  // Nothing earlier than the bound can be picked
  const minDay = min?.slice(0, 10)
  const clamp = (moment: string) => (min && moment < min ? min : moment)

  // A datetime keeps the time already chosen
  const pick = (nextDay: string) => {
    if (minDay && nextDay < minDay) return
    if (timed) return onChange(clamp(`${nextDay}T${time || defaultTimes[0]}`))

    onChange(nextDay)
    if (!isWheel) close()
  }

  // Adding the hour keeps the days, dropping it keeps them too
  const toggleTime = () => {
    const next = !timed
    setWantTime(next)

    if (range && startDay && endDay) {
      onChange([stamp(startDay, clocks[0], next), stamp(endDay, clocks[1], next)])
    } else if (!range && day) {
      onChange(stamp(day, defaultTimes[0], next))
    }
  }

  const clear = () => {
    onChange(range ? [] : '')
    picking.reset()
    close()
  }

  const triggerLabel = range
    ? startDay && endDay
      ? timed
        ? `${formatWallDayTime(rangeStart)} – ${formatWallDayTime(rangeEnd)}`
        : formatDayRange(startDay, endDay)
      : null
    : day
      ? timed
        ? formatWallDayTime(single)
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
              <DateWheel value={day || firstDay()} onChange={pick} />
            ) : isPickingYear ? (
              <>
                <div className={DATE_PICKER_STYLES.head}>
                  <button
                    type="button"
                    aria-label={PICKER_COPY.pickYear}
                    className={DATE_PICKER_STYLES.monthPick}
                    onClick={() => setPickingYear(false)}
                  >
                    {periodLabel(cursor, 'month')}
                  </button>
                </div>
                <DateWheel period value={cursor} onChange={setCursor} />
              </>
            ) : (
              <DayGrid
                cursor={cursor}
                onCursor={setCursor}
                day={day}
                minDay={minDay}
                span={picking.span}
                range={range}
                isAnchored={picking.isAnchored}
                onHover={picking.hover}
                onTitle={() => setPickingYear(true)}
                onPick={range ? (next) => picking.step(next) && onChange([]) : pick}
              />
            )}

            <div className={DATE_PICKER_STYLES.footer}>
              {range && !timed && (
                <span className={DATE_PICKER_STYLES.hint}>{PICKER_COPY.rangeHint}</span>
              )}
              {range && timed && (
                <>
                  {[0, 1].map((side) => (
                    <input
                      key={side}
                      type="time"
                      value={clocks[side]}
                      disabled={!startDay || !endDay}
                      aria-label={`${PICKER_COPY.time} ${side === 0 ? PICKER_COPY.start : PICKER_COPY.end}`}
                      className={DATE_PICKER_STYLES.time}
                      onChange={(event) => {
                        const next =
                          side === 0
                            ? [event.target.value, clocks[1]]
                            : [clocks[0], event.target.value]
                        onChange([stamp(startDay, next[0]), stamp(endDay, next[1])])
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    className={cn(DATE_PICKER_STYLES.action, 'ml-auto')}
                    onClick={close}
                  >
                    {PICKER_COPY.done}
                  </button>
                </>
              )}
              {hoursLocked && !range && (
                <Tip label={PICKER_COPY.allDayLocked} floating>
                  <input
                    type="time"
                    value=""
                    disabled
                    aria-label={PICKER_COPY.time}
                    className={cn(DATE_PICKER_STYLES.time, 'cursor-not-allowed opacity-50')}
                  />
                </Tip>
              )}
              {timed && !range && (
                <input
                  type="time"
                  value={time}
                  min={minDay && day === minDay ? min?.slice(11, 16) : undefined}
                  aria-label={PICKER_COPY.time}
                  className={DATE_PICKER_STYLES.time}
                  onChange={(event) =>
                    onChange(clamp(`${day || toDayKey(new Date())}T${event.target.value}`))
                  }
                />
              )}
              {!withTime && !dayOnly && !hoursLocked && (
                <button
                  type="button"
                  aria-pressed={timed}
                  className={cn(DATE_PICKER_STYLES.action, timed && DATE_PICKER_STYLES.actionOn)}
                  onClick={toggleTime}
                >
                  {PICKER_COPY.time}
                </button>
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
                className={cn(DATE_PICKER_STYLES.action, range && !timed && 'ml-auto')}
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
