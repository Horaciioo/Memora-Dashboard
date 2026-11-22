'use client'

import { Button } from '@/components/elements/actions/Button'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { CalendarAgenda } from '@/composites/calendar/CalendarAgenda'
import { MeetingRequest } from '@/composites/calendar/MeetingRequest'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_MOBILE } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import { coversDay, periodLabel, unitGrid } from '@/utils/format/calendar'

export interface CalendarDaySheetProps {
  // ISO day opened, null when closed
  dayKey: string | null
  entries: CalendarEntry[]
  selection: string[]
  // Managers add events, moderators ask for a meeting
  canManage: boolean
  onOpen: (entry: CalendarEntry, additive: boolean) => void
  onCreate: (dayKey: string) => void
  onClose: () => void
}

/**
 * Events of a day touched on the phone month, a sunset button below to add one
 * @param {string | null} dayKey - Day opened
 * @param {CalendarEntry[]} entries - Entries on screen
 * @param {string[]} selection - Selected entry identifiers
 * @param {boolean} canManage - Member may create events
 * @param {(entry: CalendarEntry, additive: boolean) => void} onOpen - Open an entry
 * @param {(dayKey: string) => void} onCreate - Start an event on that day
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const CalendarDaySheet = ({
  dayKey,
  entries,
  selection,
  canManage,
  onOpen,
  onCreate,
  onClose,
}: CalendarDaySheetProps) => {
  const isEmpty =
    !dayKey || !entries.some((entry) => coversDay(entry.startsAt, entry.endsAt, dayKey))

  return (
    <BottomSheet
      open={dayKey !== null}
      onClose={onClose}
      title={CALENDAR_COPY.day}
      figure={
        dayKey && <span className={CALENDAR_MOBILE.sheetTitle}>{periodLabel(dayKey, 'day')}</span>
      }
    >
      {dayKey && (
        <div className={CALENDAR_MOBILE.sheetBody}>
          {!isEmpty && (
            <CalendarAgenda
              days={unitGrid(dayKey, 'day')}
              entries={entries}
              selection={selection}
              onOpen={onOpen}
              headless
            />
          )}
          {canManage ? (
            <Button
              variant="primary"
              onClick={() => onCreate(dayKey)}
              className={CALENDAR_MOBILE.sheetAdd}
            >
              {isEmpty ? CALENDAR_COPY.add : CALENDAR_COPY.addAnother}
            </Button>
          ) : (
            <MeetingRequest />
          )}
        </div>
      )}
    </BottomSheet>
  )
}
