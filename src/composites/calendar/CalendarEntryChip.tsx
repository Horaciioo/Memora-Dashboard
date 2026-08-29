'use client'

import type { MouseEvent } from 'react'

import { Glyph } from '@/components/elements/display/Glyph'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'
import { timeOf } from '@/utils/format/calendar'

export interface CalendarEntryChipProps {
  entry: CalendarEntry
  // Draws a full width band instead of a card
  band?: boolean
  // Band reaches its own start, so it gets a rounded left edge
  opensBand?: boolean
  // Band reaches its own end, so it gets a rounded right edge
  closesBand?: boolean
  selected: boolean
  draggable: boolean
  onOpen: (entry: CalendarEntry, additive: boolean) => void
  dragProps?: Record<string, unknown>
}

/**
 * One entry on the grid, a card on a slot or a band running across days
 * @param {CalendarEntry} entry - Entry to draw
 * @param {boolean} [band] - Draws as a band
 * @param {boolean} [opensBand] - Band starts here
 * @param {boolean} [closesBand] - Band ends here
 * @param {boolean} selected - Entry sits in the current selection
 * @param {boolean} draggable - Entry may be moved
 * @param {(entry: CalendarEntry, additive: boolean) => void} onOpen - Open or select handler
 * @param {Record<string, unknown>} [dragProps] - Drag handlers of the board
 * @return {JSX.Element}
 */

export const CalendarEntryChip = ({
  entry,
  band,
  opensBand,
  closesBand,
  selected,
  draggable,
  onOpen,
  dragProps,
}: CalendarEntryChipProps) => {
  const paint = accentPaint(entry.accent, 'brand')

  // A modifier key gathers a selection instead of opening the entry
  const open = (event: MouseEvent<HTMLButtonElement>) =>
    onOpen(entry, event.shiftKey || event.metaKey || event.ctrlKey)

  return (
    <button
      type="button"
      title={entry.readOnly ? `${entry.title} · ${CALENDAR_COPY.readOnlyNotice}` : entry.title}
      aria-pressed={selected}
      onClick={open}
      style={paint.style}
      className={cn(
        band ? CALENDAR_STYLES.bar : CALENDAR_STYLES.entry,
        band && (opensBand ? CALENDAR_STYLES.barStart : CALENDAR_STYLES.barRunsIn),
        band && (closesBand ? CALENDAR_STYLES.barEnd : CALENDAR_STYLES.barRunsOut),
        paint.soft,
        paint.text,
        entry.readOnly && cn(CALENDAR_STYLES.entryReadOnly, paint.border),
        selected && CALENDAR_STYLES.entrySelected
      )}
      {...(draggable ? (dragProps ?? {}) : {})}
    >
      {!entry.allDay && <span className={CALENDAR_STYLES.entryTime}>{timeOf(entry.startsAt)}</span>}
      {!(band && !opensBand) && <Glyph value={entry.emoji} size="chip" />}
      <span className={CALENDAR_STYLES.entryTitle}>{band && !opensBand ? ' ' : entry.title}</span>
    </button>
  )
}
