'use client'

import { useMemo } from 'react'

import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_SOURCE_REGISTRY } from '@/declarations/calendar/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentColour } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'
import type { CalendarSourceName } from '@/utils/constants/workflow'

export interface CalendarLegendProps {
  entries: CalendarEntry[]
  hidden: CalendarSourceName[]
  onToggle: (source: CalendarSourceName) => void
}

/**
 * Colours drawn on the grid, and the origins they can be read from
 * @param {CalendarEntry[]} entries - Entries of the window on screen
 * @param {CalendarSourceName[]} hidden - Origins currently filtered out
 * @param {(source: CalendarSourceName) => void} onToggle - Origin filter handler
 * @return {JSX.Element}
 */

export const CalendarLegend = ({ entries, hidden, onToggle }: CalendarLegendProps) => {
  // One row per colour actually on the grid, so the legend never lists what is not drawn
  const colours = useMemo(() => {
    const rows = new Map<string, { label: string; accent: string; count: number }>()

    for (const entry of entries) {
      const accent = entry.accent ?? ''
      const key = `${entry.legendLabel}:${accent}`
      const known = rows.get(key)

      rows.set(key, {
        label: entry.legendLabel,
        accent,
        count: (known?.count ?? 0) + 1,
      })
    }

    return [...rows.values()].sort((left, right) => right.count - left.count)
  }, [entries])

  const counts = useMemo(() => {
    const tally = new Map<string, number>()
    for (const entry of entries) tally.set(entry.source, (tally.get(entry.source) ?? 0) + 1)

    return tally
  }, [entries])

  return (
    <div className={CALENDAR_STYLES.legend}>
      <div className={CALENDAR_STYLES.legendGroup}>
        <span className={CALENDAR_STYLES.legendTitle}>{CALENDAR_COPY.legendColours}</span>
        {colours.length === 0 ? (
          <span className={CALENDAR_STYLES.legendCount}>{CALENDAR_COPY.legendEmpty}</span>
        ) : (
          colours.map((row) => (
            <span key={`${row.label}:${row.accent}`} className={CALENDAR_STYLES.legendRow}>
              <span
                className={CALENDAR_STYLES.legendDot}
                style={{ backgroundColor: accentColour(row.accent, 'neutral') }}
                aria-hidden="true"
              />
              {row.label}
              <span className={CALENDAR_STYLES.legendCount}>{row.count}</span>
            </span>
          ))
        )}
      </div>

      <div className={CALENDAR_STYLES.legendGroup}>
        <span className={CALENDAR_STYLES.legendTitle}>{CALENDAR_COPY.legendSources}</span>
        {CALENDAR_SOURCE_REGISTRY.keys.map((key) => {
          const source = CALENDAR_SOURCE_REGISTRY.get(key)
          const Icon = ICONS[source.icon]
          const isHidden = hidden.includes(key)

          return (
            <button
              key={key}
              type="button"
              aria-pressed={!isHidden}
              title={source.summary}
              onClick={() => onToggle(key)}
              className={cn(CALENDAR_STYLES.legendRow, isHidden && CALENDAR_STYLES.legendRowMuted)}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {source.label}
              <span className={CALENDAR_STYLES.legendCount}>{counts.get(key) ?? 0}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
