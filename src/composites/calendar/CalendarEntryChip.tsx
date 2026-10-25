'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

import { CalendarEntryPreview } from '@/composites/calendar/CalendarEntryPreview'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { mobileToneOfEntry } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { ACCENT_STYLES, accentColour, accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'
import { timeOf } from '@/utils/format/calendar'

export interface CalendarEntryChipProps {
  entry: CalendarEntry
  // Draws a full width band instead of a card
  band?: boolean
  // Band reaches its own start
  opensBand?: boolean
  // Band reaches its own end
  closesBand?: boolean
  // Band repeats its title
  titled?: boolean
  selected: boolean
  draggable: boolean
  onOpen: (entry: CalendarEntry, additive: boolean) => void
  dragProps?: Record<string, unknown>
  // Fills its grid seat
  fill?: boolean
  // One line
  compact?: boolean
  // Bullet and words on one line
  line?: boolean
  // Overrides the start time
  timeLabel?: string
}

// Pointer rest before the preview opens
const HOVER_DELAY = 140

/**
 * One entry on the grid
 * @param {CalendarEntry} entry - Entry to draw
 * @param {boolean} [band] - Draws as a band
 * @param {boolean} [opensBand] - Band starts here
 * @param {boolean} [closesBand] - Band ends here
 * @param {boolean} [titled] - Band shows its title
 * @param {boolean} selected - Entry sits in the current selection
 * @param {boolean} draggable - Entry may be moved
 * @param {(entry: CalendarEntry, additive: boolean) => void} onOpen - Open or select handler
 * @param {Record<string, unknown>} [dragProps] - Drag handlers of the board
 * @param {boolean} [fill] - Fills its seat
 * @param {boolean} [compact] - Single line
 * @param {boolean} [line] - Bullet line
 * @param {string} [timeLabel] - Shown time
 * @return {JSX.Element}
 */

export const CalendarEntryChip = ({
  entry,
  band,
  opensBand,
  closesBand,
  titled,
  selected,
  draggable,
  onOpen,
  dragProps,
  fill,
  compact,
  line,
  timeLabel,
}: CalendarEntryChipProps) => {
  // An entry wears the colour of its creator
  // Annual review slots: grey while nobody took them, pink once someone did
  const isFree = entry.slot === 'open' || entry.slot === 'range'
  const paint = accentPaint(
    entry.slot === 'taken' || isFree ? null : entry.accent,
    entry.muted || isFree ? 'neutral' : 'brand'
  )
  // A stored colour is laid on the surface so nothing shows through
  const opaque = paint.soft === ACCENT_STYLES.soft ? 'accent-paper' : paint.soft
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const RollCallIcon = ICONS.meetings

  // Never leave a timer running once the chip is gone
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  // A trailing band segment carries no title
  const showsTitle = !band || opensBand || titled
  const previewable = showsTitle

  const openPreview = (element: HTMLElement) => {
    if (!previewable) return

    // Hover then focus must not stack two timers
    if (timer.current) clearTimeout(timer.current)

    const rect = element.getBoundingClientRect()
    timer.current = setTimeout(() => setAnchor(rect), HOVER_DELAY)
  }

  const closePreview = () => {
    if (timer.current) clearTimeout(timer.current)
    setAnchor(null)
  }

  // A modifier key gathers a selection instead of opening the entry
  const open = (event: MouseEvent<HTMLButtonElement>) => {
    closePreview()
    onOpen(entry, event.shiftKey || event.metaKey || event.ctrlKey)
  }

  return (
    <>
      <button
        type="button"
        aria-label={
          entry.readOnly ? `${entry.title}, ${CALENDAR_COPY.readOnlyNotice}` : entry.title
        }
        aria-pressed={selected}
        onClick={open}
        onMouseEnter={(event) => openPreview(event.currentTarget)}
        onMouseLeave={closePreview}
        onFocus={(event) => openPreview(event.currentTarget)}
        onBlur={closePreview}
        style={
          {
            ...paint.style,
            '--accent-mobile': accentColour(mobileToneOfEntry(entry)),
          } as CSSProperties
        }
        className={
          line && !band
            ? cn(
                'chip-solid',
                CALENDAR_STYLES.line,
                entry.muted
                  ? cn(CALENDAR_STYLES.entryMuted, opaque, paint.text)
                  : cn(opaque, CALENDAR_STYLES.entryTint),
                entry.readOnly && 'cursor-pointer',
                selected && CALENDAR_STYLES.entrySelected
              )
            : cn(
                'chip-solid',
                band ? CALENDAR_STYLES.bar : CALENDAR_STYLES.entry,
                band && (opensBand ? CALENDAR_STYLES.barStart : CALENDAR_STYLES.barRunsIn),
                band && (closesBand ? CALENDAR_STYLES.barEnd : CALENDAR_STYLES.barRunsOut),
                // A period is a translucent tinted box with a coloured dashed edge
                band
                  ? cn(paint.soft, paint.border)
                  : entry.muted
                    ? cn(CALENDAR_STYLES.entryMuted, opaque, paint.text)
                    : cn(opaque, CALENDAR_STYLES.entryTint),
                entry.readOnly && !band && cn(CALENDAR_STYLES.entryReadOnly, paint.border),
                selected && CALENDAR_STYLES.entrySelected,
                fill && CALENDAR_STYLES.entryFill,
                !compact && !band && !entry.rollCall && CALENDAR_STYLES.entryStacked,
                compact && CALENDAR_STYLES.entryCompact,
                entry.rollCall && CALENDAR_STYLES.entryRollCall
              )
        }
        {...(draggable ? (dragProps ?? {}) : {})}
      >
        {line && !band ? (
          <>
            {!entry.allDay && (
              <span className={CALENDAR_STYLES.lineTime}>
                {timeLabel ?? timeOf(entry.startsAt)}
              </span>
            )}
            <span className={CALENDAR_STYLES.lineTitle}>{entry.title}</span>
          </>
        ) : (
          <>
            {!entry.allDay && (
              <span className={cn(CALENDAR_STYLES.entryTime, band && 'hidden md:inline')}>
                {timeLabel ?? timeOf(entry.startsAt)}
              </span>
            )}
            {previewable && entry.rollCall && (
              <RollCallIcon
                className={cn(
                  CALENDAR_STYLES.chipMark,
                  entry.rollCall && CALENDAR_STYLES.chipMarkRollCall,
                  band && 'hidden md:block'
                )}
                aria-hidden="true"
              />
            )}
            <span className={band ? CALENDAR_STYLES.barTitle : CALENDAR_STYLES.entryTitle}>
              {showsTitle ? entry.title : '\u00a0'}
            </span>
          </>
        )}
      </button>
      {anchor && <CalendarEntryPreview entry={entry} anchor={anchor} />}
    </>
  )
}
