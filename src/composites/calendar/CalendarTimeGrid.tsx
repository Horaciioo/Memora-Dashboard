'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, PointerEvent, ReactNode } from 'react'

import { CalendarEntryChip } from '@/composites/calendar/CalendarEntryChip'
import { CALENDAR_COPY, WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import { CALENDAR_SETTINGS } from '@/declarations/configurations/settings'
import { ICONS } from '@/declarations/ui/icons'
import { CALENDAR_GRID_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'
import type { CalendarDay } from '@/utils/format/calendar'
import { minuteLabel, minutesLabel, spanOnDay, toDayKey, weekdayOf } from '@/utils/format/calendar'
import { placeInLanes } from '@/utils/lanes'

/**
 * Drawn rectangle
 * @typedef {Object} GridRange
 * @property {string} fromDay - First ISO day
 * @property {string} toDay - Last ISO day
 * @property {number} startMinute - Opening minute
 * @property {number} endMinute - Closing minute
 */

export interface GridRange {
  fromDay: string
  toDay: string
  startMinute: number
  endMinute: number
}

/**
 * What the pointer draws
 * @type {'draw' | 'select'}
 */

export type GridMode = 'draw' | 'select'

export interface CalendarTimeGridProps {
  days: CalendarDay[]
  // Timed events only
  entries: CalendarEntry[]
  // Grid template of the columns
  columns: string
  canManage: boolean
  mode: GridMode
  selection: string[]
  onDraw: (range: GridRange) => void
  onSelectMany: (ids: string[]) => void
  onMove: (entry: CalendarEntry, dayKey: string, startMinute: number) => void
  onOpen: (entry: CalendarEntry, additive: boolean) => void
  // Background of a day
  renderZones: (dayKey: string) => ReactNode
  // All-day entries of the agenda
  agendaExtras?: (dayKey: string) => CalendarEntry[]
}

// Grid window, minutes
const DAY_START = CALENDAR_SETTINGS.dayStartHour * 60
const DAY_END = (CALENDAR_SETTINGS.dayEndHour + 1) * 60
const DAY_SPAN = DAY_END - DAY_START
const ROW = CALENDAR_SETTINGS.rowMinutes
const STEP = CALENDAR_SETTINGS.stepMinutes

// Under this, one line
const COMPACT_MINUTES = ROW / 2

// Clock refresh
const NOW_TICK_MS = 60_000

// Minute to height share
const topPercent = (minute: number): number => ((minute - DAY_START) / DAY_SPAN) * 100
const spanPercent = (minutes: number): number => (minutes / DAY_SPAN) * 100
const clamp = (minute: number): number => Math.min(Math.max(minute, DAY_START), DAY_END)

// Step snap
const snap = (minute: number): number => clamp(Math.round(minute / STEP) * STEP)

// Row opening minute
const rowOf = (minute: number): number =>
  Math.min(
    Math.max(Math.floor((minute - DAY_START) / ROW) * ROW + DAY_START, DAY_START),
    DAY_END - ROW
  )

/**
 * Day and minute under a pointer
 * @param {PointerEvent | DragEvent} event - Board event
 * @return {{ day: string, minute: number } | null} - Null off a column
 */

const pointOf = (
  event: PointerEvent<HTMLElement> | DragEvent<HTMLElement>
): { day: string; minute: number } | null => {
  const column = (event.target as HTMLElement).closest<HTMLElement>('[data-grid-day]')
  const day = column?.dataset.gridDay
  if (!column || !day) return null

  const bounds = column.getBoundingClientRect()

  return { day, minute: DAY_START + ((event.clientY - bounds.top) / bounds.height) * DAY_SPAN }
}

/**
 * Rectangle between two cells
 * @param {Object} anchor - Drag start cell
 * @param {string} anchor.day - ISO day
 * @param {number} anchor.minute - Row minute
 * @param {Object} current - Cell under pointer
 * @param {string} current.day - ISO day
 * @param {number} current.minute - Row minute
 * @return {GridRange} - Whole rows covered
 */

const toRange = (
  anchor: { day: string; minute: number },
  current: { day: string; minute: number }
): GridRange => ({
  fromDay: anchor.day <= current.day ? anchor.day : current.day,
  toDay: anchor.day <= current.day ? current.day : anchor.day,
  startMinute: Math.min(anchor.minute, current.minute),
  endMinute: Math.min(Math.max(anchor.minute, current.minute) + ROW, DAY_END),
})

/**
 * Timed entry placed on one day
 * @typedef {Object} DayItem
 * @property {CalendarEntry} entry - Entry
 * @property {number} startMinute - Clipped start
 * @property {number} endMinute - Clipped end
 */

interface DayItem {
  entry: CalendarEntry
  startMinute: number
  endMinute: number
}

/**
 * Day and week board, placed to the minute
 * @param {CalendarTimeGridProps} props - Days, entries, rights and handlers
 * @return {JSX.Element}
 */

export const CalendarTimeGrid = ({
  days,
  entries,
  columns,
  canManage,
  mode,
  selection,
  onDraw,
  onSelectMany,
  onMove,
  onOpen,
  renderZones,
  agendaExtras,
}: CalendarTimeGridProps) => {
  const [drawn, setDrawn] = useState<{
    anchor: { day: string; minute: number }
    current: { day: string; minute: number }
  } | null>(null)
  const [dragged, setDragged] = useState<CalendarEntry | null>(null)
  const [dropDay, setDropDay] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const AddIcon = ICONS.add

  // Moving clock
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), NOW_TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  const todayKey = toDayKey(now)
  const nowMinute = now.getHours() * 60 + now.getMinutes()
  const showsNow = nowMinute >= DAY_START && nowMinute <= DAY_END
  const range = drawn ? toRange(drawn.anchor, drawn.current) : null

  const rows = useMemo(
    () => Array.from({ length: Math.ceil(DAY_SPAN / ROW) }, (_, index) => DAY_START + index * ROW),
    []
  )

  // Entries clipped per day
  const byDay = useMemo(() => {
    const buckets = new Map<string, DayItem[]>()

    for (const day of days) {
      buckets.set(
        day.key,
        entries
          .filter(
            (entry) =>
              toDayKey(entry.startsAt) <= day.key &&
              (entry.endsAt ? toDayKey(entry.endsAt) : toDayKey(entry.startsAt)) >= day.key
          )
          .map((entry) => {
            const span = spanOnDay(entry.startsAt, entry.endsAt, day.key, ROW)

            return {
              entry,
              startMinute: clamp(span.startMinute),
              endMinute: clamp(span.endMinute),
            }
          })
          .filter((item) => item.endMinute > item.startMinute)
      )
    }

    return buckets
  }, [days, entries])

  const startDrawing = (event: PointerEvent<HTMLDivElement>) => {
    if (!canManage || event.button !== 0) return
    // Cards keep their click
    if ((event.target as HTMLElement).closest('button')) return

    const point = pointOf(event)
    if (!point) return

    event.preventDefault()
    const cell = { day: point.day, minute: rowOf(point.minute) }
    setDrawn({ anchor: cell, current: cell })
  }

  const extendDrawing = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawn) return

    const point = pointOf(event)
    if (point)
      setDrawn({ anchor: drawn.anchor, current: { day: point.day, minute: rowOf(point.minute) } })
  }

  const commitDrawing = () => {
    if (!drawn || !range) return

    setDrawn(null)

    // Selection catches overlaps
    if (mode === 'select') {
      const caught = days
        .filter((day) => day.key >= range.fromDay && day.key <= range.toDay)
        .flatMap((day) => byDay.get(day.key) ?? [])
        .filter(
          (item) =>
            !item.entry.readOnly &&
            item.startMinute < range.endMinute &&
            item.endMinute > range.startMinute
        )
        .map((item) => item.entry.id)

      onSelectMany([...new Set(caught)])
      return
    }

    onDraw(range)
  }

  const dropEntry = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const point = pointOf(event)

    // Length kept, start snapped
    if (dragged && point) {
      const length = dragged.endsAt
        ? (new Date(dragged.endsAt).getTime() - new Date(dragged.startsAt).getTime()) / 60_000
        : ROW
      const startMinute = Math.max(
        Math.min(snap(point.minute), DAY_END - Math.min(length, DAY_SPAN)),
        DAY_START
      )

      onMove(dragged, point.day, startMinute)
    }

    setDragged(null)
    setDropDay(null)
  }

  const clickDay = (dayKey: string, startMinute: number) =>
    onDraw({
      fromDay: dayKey,
      toDay: dayKey,
      startMinute,
      endMinute: Math.min(startMinute + CALENDAR_SETTINGS.defaultDurationMinutes, DAY_END),
    })

  return (
    <>
      <div
        className={cn(CALENDAR_GRID_STYLES.board, columns, drawn && CALENDAR_GRID_STYLES.painting)}
        onPointerDown={startDrawing}
        onPointerMove={extendDrawing}
        onPointerUp={commitDrawing}
        onPointerCancel={() => setDrawn(null)}
        onPointerLeave={commitDrawing}
        onDragOver={(event) => {
          const point = pointOf(event)
          if (!dragged || !point) return

          event.preventDefault()
          setDropDay(point.day)
        }}
        onDrop={dropEntry}
      >
        <div className={CALENDAR_GRID_STYLES.hourColumn}>
          {rows.map((minute) => (
            <div
              key={minute}
              className={cn(CALENDAR_GRID_STYLES.hourCell, CALENDAR_GRID_STYLES.rowHeight)}
            >
              <span className={CALENDAR_GRID_STYLES.hourLabel}>{minuteLabel(minute)}</span>
            </div>
          ))}
        </div>

        {days.map((day) => {
          const isToday = day.key === todayKey
          const isPast = day.key < todayKey
          const placed = placeInLanes(byDay.get(day.key) ?? [])
          const isDrawnOn = range !== null && day.key >= range.fromDay && day.key <= range.toDay

          return (
            <div
              key={day.key}
              data-grid-day={day.key}
              className={cn(
                CALENDAR_GRID_STYLES.dayColumn,
                isToday && CALENDAR_GRID_STYLES.dayColumnToday,
                dropDay === day.key && CALENDAR_GRID_STYLES.dropTarget
              )}
            >
              {renderZones(day.key)}

              {rows.map((minute) => (
                <div
                  key={minute}
                  className={cn(CALENDAR_GRID_STYLES.rowLine, CALENDAR_GRID_STYLES.rowHeight)}
                >
                  {canManage && mode === 'draw' && (
                    <button
                      type="button"
                      aria-label={`${CALENDAR_COPY.add}, ${WEEKDAY_LABELS[weekdayOf(day.key)]} ${minuteLabel(minute)}`}
                      className={CALENDAR_GRID_STYLES.cellAdd}
                      onClick={() => clickDay(day.key, minute)}
                    >
                      <AddIcon className={CALENDAR_GRID_STYLES.cellAddIcon} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}

              {(isPast || (isToday && showsNow)) && (
                <div
                  className={CALENDAR_GRID_STYLES.past}
                  style={{
                    top: 0,
                    height: `${isPast ? 100 : Math.max(topPercent(nowMinute), 0)}%`,
                  }}
                />
              )}

              <div className={CALENDAR_GRID_STYLES.entryLayer}>
                {placed.map(({ item, lane, lanes }) => (
                  <div
                    key={item.entry.id}
                    className={cn(
                      CALENDAR_GRID_STYLES.entrySeat,
                      dragged?.id === item.entry.id && CALENDAR_GRID_STYLES.entryDragging
                    )}
                    style={{
                      top: `${topPercent(item.startMinute)}%`,
                      height: `${spanPercent(item.endMinute - item.startMinute)}%`,
                      left: `${(lane / lanes) * 100}%`,
                      width: `${100 / lanes}%`,
                    }}
                  >
                    <CalendarEntryChip
                      entry={item.entry}
                      fill
                      compact={item.endMinute - item.startMinute <= COMPACT_MINUTES}
                      selected={selection.includes(item.entry.id)}
                      draggable={canManage && !item.entry.readOnly}
                      onOpen={onOpen}
                      dragProps={{
                        draggable: true,
                        onDragStart: () => setDragged(item.entry),
                        onDragEnd: () => {
                          setDragged(null)
                          setDropDay(null)
                        },
                      }}
                    />
                  </div>
                ))}
              </div>

              {isDrawnOn && range && (
                <div
                  className={CALENDAR_GRID_STYLES.painted}
                  style={{
                    top: `${topPercent(range.startMinute)}%`,
                    height: `${spanPercent(range.endMinute - range.startMinute)}%`,
                  }}
                >
                  <span className={CALENDAR_GRID_STYLES.paintedLabel}>
                    {minutesLabel(range.startMinute, range.endMinute)}
                  </span>
                </div>
              )}

              {isToday && showsNow && (
                <div
                  className={CALENDAR_GRID_STYLES.nowLine}
                  style={{ top: `${topPercent(nowMinute)}%` }}
                >
                  <span className={CALENDAR_GRID_STYLES.nowLabel}>{minuteLabel(nowMinute)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={CALENDAR_GRID_STYLES.agenda}>
        {days.map((day) => {
          const items = [...(byDay.get(day.key) ?? [])].sort(
            (first, second) => first.startMinute - second.startMinute
          )
          const extras = agendaExtras?.(day.key) ?? []

          return (
            <div
              key={day.key}
              className={cn(
                CALENDAR_GRID_STYLES.agendaDay,
                items.length + extras.length === 0 && CALENDAR_GRID_STYLES.agendaDayEmpty
              )}
            >
              <div className={CALENDAR_GRID_STYLES.agendaHead}>
                <span className={CALENDAR_GRID_STYLES.agendaDayName}>
                  {WEEKDAY_LABELS[weekdayOf(day.key)]}
                </span>
                <span
                  className={
                    day.key === todayKey
                      ? CALENDAR_GRID_STYLES.agendaToday
                      : CALENDAR_GRID_STYLES.agendaDayName
                  }
                >
                  {day.dayOfMonth}
                </span>
                {canManage && (
                  <button
                    type="button"
                    aria-label={`${CALENDAR_COPY.add}, ${WEEKDAY_LABELS[weekdayOf(day.key)]}`}
                    className={CALENDAR_GRID_STYLES.agendaAdd}
                    onClick={() =>
                      clickDay(
                        day.key,
                        day.key === todayKey
                          ? Math.min(rowOf(nowMinute) + ROW, DAY_END - ROW)
                          : DAY_START
                      )
                    }
                  >
                    <AddIcon className={CALENDAR_GRID_STYLES.cellAddIcon} aria-hidden="true" />
                  </button>
                )}
              </div>

              {extras.map((entry) => (
                <CalendarEntryChip
                  key={entry.id}
                  entry={entry}
                  selected={selection.includes(entry.id)}
                  draggable={false}
                  onOpen={onOpen}
                />
              ))}

              {items.map((item) => (
                <CalendarEntryChip
                  key={item.entry.id}
                  entry={item.entry}
                  selected={selection.includes(item.entry.id)}
                  draggable={false}
                  onOpen={onOpen}
                  timeLabel={minuteLabel(item.startMinute)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}
