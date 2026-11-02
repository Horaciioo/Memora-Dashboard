'use client'

import { useCallback, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { MEETING_REQUEST_FIELDS } from '@/declarations/calendar/request'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { beaconProps } from '@/declarations/ui/beacons'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import type { FormValues } from '@/types/forms'

export interface MeetingRequestProps {
  // Icon alone, for the phone header
  compact?: boolean
}

/**
 * The one thing a moderator does on the calendar: ask their responsables for a meeting
 * @param {boolean} [compact] - Icon alone
 * @return {JSX.Element}
 */

export const MeetingRequest = ({ compact }: MeetingRequestProps) => {
  const [isOpen, setOpen] = useState(false)
  const { isSaving, issues, run } = useMutation()

  const send = useCallback(
    async (values: FormValues) =>
      (await run(() => apiPost(API_ROUTES.meetingRequests, values), CALENDAR_COPY.requestSent)) !==
      null,
    [run]
  )

  return (
    <>
      <span {...beaconProps(TOUR_BEACONS.calendarRequest)}>
        {compact ? (
          <Button
            variant="primary"
            icon="add"
            aria-label={CALENDAR_COPY.requestMeeting}
            title={CALENDAR_COPY.requestMeeting}
            onClick={() => setOpen(true)}
          />
        ) : (
          <Button variant="primary" onClick={() => setOpen(true)}>
            {CALENDAR_COPY.requestMeeting}
          </Button>
        )}
      </span>

      <FormDrawer
        open={isOpen}
        subject={FORM_SUBJECTS.meetingRequest}
        title={CALENDAR_COPY.requestMeeting}
        note={CALENDAR_COPY.requestLead}
        fields={MEETING_REQUEST_FIELDS}
        issues={issues}
        isSaving={isSaving}
        submitVerb={CALENDAR_COPY.requestSend}
        onSubmit={send}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
