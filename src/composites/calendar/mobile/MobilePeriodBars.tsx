'use client'

import type { CSSProperties } from 'react'

import type { LanedRun } from '@/core/lib/calendar/periodLanes'
import { mobileToneOfEntry } from '@/declarations/calendar/registries'
import { accentColour } from '@/declarations/ui/theme'
import { CALENDAR_MOBILE } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { cn } from '@/utils/classnames'

export interface MobilePeriodBarsProps {
  placed: LanedRun[]
  columns: number
  onOpen: (entry: CalendarEntry) => void
}

/**
 * Periods of one week of the month as bars running across their days, the title written once
 * @param {LanedRun[]} placed - Runs of the week with their line
 * @param {number} columns - Days of the week
 * @param {(entry: CalendarEntry) => void} onOpen - Open a period
 * @return {JSX.Element | null}
 */

export const MobilePeriodBars = ({ placed, columns, onOpen }: MobilePeriodBarsProps) => {
  if (placed.length === 0) return null

  return (
    <span
      className={CALENDAR_MOBILE.lanes}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {placed.map(({ run, lane }) => (
        <button
          key={`${run.entry.id}:${run.row}:${run.from}`}
          type="button"
          onClick={() => onOpen(run.entry)}
          className={cn(
            CALENDAR_MOBILE.lane,
            run.opens && CALENDAR_MOBILE.laneOpens,
            run.closes && CALENDAR_MOBILE.laneCloses
          )}
          style={
            {
              gridColumn: `${run.from + 1} / ${run.to + 2}`,
              gridRow: lane + 1,
              '--accent-mobile': accentColour(mobileToneOfEntry(run.entry)),
            } as CSSProperties
          }
        >
          {run.entry.title}
        </button>
      ))}
    </span>
  )
}
