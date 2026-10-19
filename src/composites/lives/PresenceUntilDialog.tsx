'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { DatePicker } from '@/components/elements/forms/date/DatePicker'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { LIVE_COORDINATION } from '@/declarations/ui/variants'
import { wallToInstant } from '@/utils/format/zone'

export interface PresenceUntilDialogProps {
  initial: string
  onConfirm: (until: string) => void
  onClose: () => void
}

/**
 * Asks until when a member moderates, they start on arriving
 * @param {string} initial - Wall clock first shown
 * @param {(until: string) => void} onConfirm - ISO instant picked
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const PresenceUntilDialog = ({ initial, onConfirm, onClose }: PresenceUntilDialogProps) => {
  const [until, setUntil] = useState(initial)
  // Opening moment
  const [arrival] = useState(() => Date.now())
  // Only a moment after arriving
  const isValid = until !== '' && +wallToInstant(until) > arrival

  return (
    <Dialog
      open
      size="sm"
      title={LIVE_PAGE_COPY.presenceUntilTitle}
      description={LIVE_PAGE_COPY.presenceUntilLead}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{ACTION_COPY.cancel}</Button>
          <Button
            variant="primary"
            disabled={!isValid}
            onClick={() => onConfirm(wallToInstant(until).toISOString())}
          >
            {LIVE_PAGE_COPY.presenceUntilConfirm}
          </Button>
        </>
      }
    >
      <div className={LIVE_COORDINATION.timeField}>
        <span className={LIVE_COORDINATION.timeLabel}>{LIVE_PAGE_COPY.presenceUntil}</span>
        <DatePicker
          label={LIVE_PAGE_COPY.presenceUntil}
          withTime
          value={until}
          onChange={(next) => setUntil(typeof next === 'string' ? next : '')}
        />
      </div>
    </Dialog>
  )
}
