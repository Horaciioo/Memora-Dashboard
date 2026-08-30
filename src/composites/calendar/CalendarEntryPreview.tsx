'use client'

import { createPortal } from 'react-dom'

import { Badge } from '@/components/elements/display/Badge'
import { Glyph } from '@/components/elements/display/Glyph'
import { CALENDAR_FIELD_COPY } from '@/declarations/calendar/copy'
import {
  CALENDAR_KIND_REGISTRY,
  CALENDAR_SOURCE_REGISTRY,
} from '@/declarations/calendar/registries'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { formatDayTime } from '@/utils/format/dates'

export interface CalendarEntryPreviewProps {
  entry: CalendarEntry
  anchor: DOMRect
}

// Width of the card, kept in sync with CALENDAR_STYLES.preview
const CARD_WIDTH = 288

// Gap between the chip and the card
const OFFSET = 8

/**
 * Floating read-only glance at a calendar entry, shown while the pointer rests on its chip
 * @param {CalendarEntry} entry - Entry under the pointer
 * @param {DOMRect} anchor - Bounding box of the chip
 * @return {JSX.Element | null}
 */

export const CalendarEntryPreview = ({ entry, anchor }: CalendarEntryPreviewProps) => {
  if (typeof document === 'undefined') return null

  // Sit above the chip by default, clamped inside the viewport
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
        <Glyph value={entry.emoji} size="chip" />
        <span className={CALENDAR_STYLES.previewTitle}>{entry.title}</span>
      </span>
      <span className="flex flex-wrap gap-1.5">
        <Badge
          label={CALENDAR_KIND_REGISTRY.label(entry.kind)}
          accent={entry.accent}
          tone="brand"
          dot
        />
        <Badge label={CALENDAR_SOURCE_REGISTRY.get(entry.source).label} tone="neutral" />
      </span>
      <div className={CALENDAR_STYLES.previewMeta}>
        <span>{`${CALENDAR_FIELD_COPY.startsAt} · ${formatDayTime(entry.startsAt)}`}</span>
        {entry.endsAt && (
          <span>{`${CALENDAR_FIELD_COPY.endsAt} · ${formatDayTime(entry.endsAt)}`}</span>
        )}
        {entry.subjectName && (
          <span>{`${CALENDAR_FIELD_COPY.subject} · ${entry.subjectName}`}</span>
        )}
      </div>
    </div>,
    document.body
  )
}
