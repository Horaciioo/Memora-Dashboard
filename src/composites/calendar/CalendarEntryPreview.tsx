'use client'

import { createPortal } from 'react-dom'

import { Glyph } from '@/components/elements/display/Glyph'
import { CALENDAR_SOURCE_REGISTRY } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'
import { entrySpan } from '@/utils/format/entrySpan'

export interface CalendarEntryPreviewProps {
  entry: CalendarEntry
  anchor: DOMRect
}

// Width of the card
const CARD_WIDTH = 288

// Gap between the chip and the card
const OFFSET = 8

/**
 * Floating read-only glance at a calendar entry
 * @param {CalendarEntry} entry - Entry under the pointer
 * @param {DOMRect} anchor - Bounding box of the chip
 * @return {JSX.Element | null}
 */

export const CalendarEntryPreview = ({ entry, anchor }: CalendarEntryPreviewProps) => {
  if (typeof document === 'undefined') return null

  const ClockIcon = ICONS.clock
  const PersonIcon = ICONS.members
  const source = CALENDAR_SOURCE_REGISTRY.get(entry.source)
  const SourceIcon = ICONS[source.icon]
  const paint = accentPaint(entry.accent, entry.muted ? 'neutral' : 'brand')

  // Sit above the chip by default
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - CARD_WIDTH - 8))
  const above = anchor.top > 220
  const top = above ? anchor.top - OFFSET : anchor.bottom + OFFSET

  return createPortal(
    <div
      role="tooltip"
      className={CALENDAR_STYLES.preview}
      style={{ left, top, transform: above ? 'translateY(-100%)' : undefined }}
    >
      <span className={CALENDAR_STYLES.previewHead}>
        <span className={cn('inline-flex', paint.text)} style={paint.style}>
          <span className={CALENDAR_STYLES.previewBullet} aria-hidden="true" />
        </span>
        <Glyph value={entry.emoji} size="chip" />
        <span className={CALENDAR_STYLES.previewTitle}>{entry.title}</span>
      </span>
      <div className={CALENDAR_STYLES.previewMeta}>
        <span className={CALENDAR_STYLES.previewLine}>
          <ClockIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
          {entrySpan(entry.startsAt, entry.endsAt, entry.allDay)}
        </span>
        {entry.subjectName && (
          <span className={CALENDAR_STYLES.previewLine}>
            <PersonIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
            {entry.subjectName}
          </span>
        )}
        <span className={CALENDAR_STYLES.previewLine}>
          <SourceIcon className={CALENDAR_STYLES.previewIcon} aria-hidden="true" />
          {source.label}
        </span>
      </div>
    </div>,
    document.body
  )
}
