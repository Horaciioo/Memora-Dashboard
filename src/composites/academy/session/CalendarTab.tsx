'use client'

import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import { CalendarBoard } from '@/composites/calendar/CalendarBoard'

/**
 * Calendar of the session
 * @return {JSX.Element}
 */

export const CalendarTab = () => {
  const { detail, fields, can, calendar } = useSessionState()

  return (
    <CalendarBoard
      initialEntries={calendar.entries}
      fields={fields.calendar}
      anchor={calendar.anchor}
      canManage={can.manageCalendar}
      sessionId={detail.summary.id}
    />
  )
}
