import type { ReactNode } from 'react'

import { zoneTitleSize } from '@/core/lib/calendar/zoneTitles'
import type { ZoneTitleSpot } from '@/core/lib/calendar/zoneTitles'
import { accentPaint } from '@/declarations/ui/theme'
import { CALENDAR_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ZoneTitleLayerProps {
  spots: ZoneTitleSpot[]
  // Backgrounds of the zones running under each column
  bands: ReactNode[]
  // Zones under the pointer, only their titles show
  shownIds: string[]
  // Columns of the row it sits over
  columns: number
  // Largest size of a title, a CSS length
  cap?: string
  className?: string
}

/**
 * Zone titles laid large across the days they cover, behind every box
 * @param {ZoneTitleSpot[]} spots - Titles of this row
 * @param {ReactNode[]} bands - Zone backgrounds, one per column
 * @param {string[]} shownIds - Zones under the pointer
 * @param {number} columns - Columns of the row
 * @param {string} [cap] - Largest size of a title
 * @param {string} [className] - Placement of the layer
 * @return {JSX.Element | null}
 */

export const ZoneTitleLayer = ({
  spots,
  bands,
  shownIds,
  columns,
  cap = '12rem',
  className,
}: ZoneTitleLayerProps) => {
  return (
    <span
      className={cn(CALENDAR_STYLES.zoneTitleLayer, className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {bands.map((band, column) => (
        <span key={column} className="relative" style={{ gridColumn: column + 1, gridRow: 1 }}>
          {band}
        </span>
      ))}
      {spots.map((spot) => {
        const paint = accentPaint(spot.zone.accent, 'neutral')

        return (
          <span
            key={spot.ids.join('+')}
            className={cn(
              CALENDAR_STYLES.zoneTitleSlot,
              !spot.ids.some((id) => shownIds.includes(id)) && 'opacity-0'
            )}
            style={{ gridColumn: `${spot.from + 1} / ${spot.to + 2}`, gridRow: 1, ...paint.style }}
          >
            <span
              className={cn(CALENDAR_STYLES.zoneTitle, paint.text)}
              style={{ fontSize: zoneTitleSize(spot.title, cap) }}
            >
              {spot.title}
            </span>
          </span>
        )
      })}
    </span>
  )
}
