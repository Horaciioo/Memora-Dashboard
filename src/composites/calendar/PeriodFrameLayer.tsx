'use client'

import type { PeriodRun } from '@/core/lib/calendar/periodRuns'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'

export interface PeriodFrameLayerProps {
  runs: PeriodRun[]
  // Columns of the row it sits over
  columns: number
  onOpen: (entry: CalendarEntry) => void
  className?: string
}

/**
 * Rounded frames drawn around everything inside a period, its title written across the top
 * @param {PeriodRun[]} runs - Runs of this row
 * @param {number} columns - Columns of the row
 * @param {(entry: CalendarEntry) => void} onOpen - Open a period
 * @param {string} [className] - Placement of the layer
 * @return {JSX.Element | null}
 */

export const PeriodFrameLayer = ({ runs, columns, onOpen, className }: PeriodFrameLayerProps) => {
  if (runs.length === 0) return null

  return (
    <span
      className={cn(CALENDAR_STYLES.periodLayer, className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {runs.map((run) => {
        const paint = accentPaint(run.entry.accent, 'neutral')

        return (
          <span
            key={`${run.entry.id}:${run.row}:${run.from}`}
            className={CALENDAR_STYLES.periodSlot}
            style={{ gridColumn: `${run.from + 1} / ${run.to + 2}`, gridRow: 1, ...paint.style }}
          >
            <span
              className={cn(
                CALENDAR_STYLES.periodFrame,
                paint.soft,
                paint.border,
                run.opens ? 'rounded-l-[1.25rem]' : 'rounded-l-none border-l-0',
                run.closes ? 'rounded-r-[1.25rem]' : 'rounded-r-none border-r-0'
              )}
              aria-hidden="true"
            />
            {run.labelled && (
              <button
                type="button"
                className={cn(CALENDAR_STYLES.periodLegend, paint.text)}
                onClick={() => onOpen(run.entry)}
              >
                {run.entry.title}
              </button>
            )}
          </span>
        )
      })}
    </span>
  )
}
