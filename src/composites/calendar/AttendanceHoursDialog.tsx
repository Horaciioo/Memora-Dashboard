'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { AttendanceHoursFields } from '@/composites/calendar/AttendanceHoursFields'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { hoursPayload } from '@/utils/format/hours'
import type { HoursInput } from '@/utils/format/hours'

export interface AttendanceHoursDialogProps {
  initial: HoursInput
  isSaving?: boolean
  // Step may be passed, on by default
  canSkip?: boolean
  onConfirm: (hours?: { from: string; to: string }) => void
  onClose: () => void
}

/**
 * Hours given after saying they will be there, skippable, mounted only while asked
 * @param {HoursInput} initial - Hours first shown
 * @param {boolean} [isSaving] - Answer in flight
 * @param {boolean} [canSkip] - Offer to pass the step
 * @param {(hours?: { from: string, to: string }) => void} onConfirm - Send the answer
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const AttendanceHoursDialog = ({
  initial,
  isSaving,
  canSkip = true,
  onConfirm,
  onClose,
}: AttendanceHoursDialogProps) => {
  const [hours, setHours] = useState(initial)

  return (
    <Dialog
      open
      size="sm"
      title={CALENDAR_COPY.hoursTitle}
      description={CALENDAR_COPY.hoursLead}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={isSaving}>
            {ACTION_COPY.cancel}
          </Button>
          {canSkip && (
            <Button variant="ghost" disabled={isSaving} onClick={() => onConfirm()}>
              {CALENDAR_COPY.hoursSkip}
            </Button>
          )}
          <Button
            variant="primary"
            isLoading={isSaving}
            disabled={!hours.from || !hours.to}
            onClick={() => onConfirm(hoursPayload(hours))}
          >
            {CALENDAR_COPY.hoursConfirm}
          </Button>
        </>
      }
    >
      <AttendanceHoursFields value={hours} onChange={setHours} />
    </Dialog>
  )
}
