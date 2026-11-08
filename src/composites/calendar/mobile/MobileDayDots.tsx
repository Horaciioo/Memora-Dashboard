import type { CSSProperties } from 'react'

import { mobileToneOfEntry } from '@/declarations/calendar/registries'
import { accentColour } from '@/declarations/ui/theme'
import { CALENDAR_MOBILE } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'

export interface MobileDayDotsProps {
  entries: CalendarEntry[]
}

/**
 * Entries of a phone month day as coloured dots, the day itself opens the list
 * @param {CalendarEntry[]} entries - Entries to stand for
 * @return {JSX.Element | null}
 */

export const MobileDayDots = ({ entries }: MobileDayDotsProps) => {
  if (entries.length === 0) return null

  return (
    <span className={CALENDAR_MOBILE.dots} aria-hidden="true">
      {entries.map((entry) => (
        <span
          key={entry.id}
          className={CALENDAR_MOBILE.dot}
          style={{ '--accent-mobile': accentColour(mobileToneOfEntry(entry)) } as CSSProperties}
        />
      ))}
    </span>
  )
}
