'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_DETAIL } from '@/declarations/ui/variants'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldOption } from '@/types/forms'
import { formatClock, formatWeekday } from '@/utils/format/dates'

export interface AnnualSlotAdminProps {
  entry: CalendarEntry
  // Other open slots of the same series
  openSlots: CalendarEntry[]
  pending: boolean
  onPlace: (accountId: string) => void
  onCancel: (moveTo: string | null) => void
  onClearOpen: () => void
}

/**
 * What a Responsable does with a slot of the annual reviews: place a Moderator on an open one, cancel or move a taken one
 * @param {CalendarEntry} entry - Slot opened
 * @param {CalendarEntry[]} openSlots - Other open slots of the series
 * @param {boolean} pending - A mutation is in flight
 * @param {(accountId: string) => void} onPlace - Place a Moderator
 * @param {(moveTo: string | null) => void} onCancel - Cancel, or move to another slot
 * @param {() => void} onClearOpen - Remove the slots nobody took
 * @return {JSX.Element | null}
 */

export const AnnualSlotAdmin = ({
  entry,
  openSlots,
  pending,
  onPlace,
  onCancel,
  onClearOpen,
}: AnnualSlotAdminProps) => {
  const [candidates, setCandidates] = useState<FieldOption[]>([])
  const [picked, setPicked] = useState('')
  const [isCancelling, setCancelling] = useState(false)
  const [moveTo, setMoveTo] = useState('')
  const [isClearing, setClearing] = useState(false)

  // Moderators still without a slot, read once the slot is open
  useEffect(() => {
    if (entry.slot !== 'open') return

    let isLive = true
    apiGet<{ id: string; name: string; avatar: string | null }[]>(API_ROUTES.calendarSlot(entry.id))
      .then((rows) => {
        if (isLive) {
          setCandidates(rows.map((row) => ({ value: row.id, label: row.name, image: row.avatar })))
        }
      })
      .catch(() => undefined)

    return () => {
      isLive = false
    }
  }, [entry.id, entry.slot])

  if (entry.slot === 'open') {
    return (
      <section className={CALENDAR_DETAIL.section}>
        <SelectMenu
          label={ANNUAL_REVIEW_COPY.placeTitle}
          options={candidates}
          value={picked}
          mark="avatar"
          placeholder={ANNUAL_REVIEW_COPY.placeChoose}
          onChange={setPicked}
        />
        <Button
          variant="primary"
          disabled={pending || picked === ''}
          onClick={() => onPlace(picked)}
        >
          {ANNUAL_REVIEW_COPY.placeVerb}
        </Button>
      </section>
    )
  }

  // On the period: the slots nobody took can all go at once
  if (entry.slot === 'series') {
    return (
      <section className={CALENDAR_DETAIL.section}>
        <Button variant="danger" disabled={pending} onClick={() => setClearing(true)}>
          {ANNUAL_REVIEW_COPY.clearOpen}
        </Button>
        <ConfirmDialog
          open={isClearing}
          title={ANNUAL_REVIEW_COPY.clearOpenTitle}
          description={ANNUAL_REVIEW_COPY.clearOpenLead}
          tone="danger"
          pending={pending}
          onConfirm={() => {
            setClearing(false)
            onClearOpen()
          }}
          onCancel={() => setClearing(false)}
        />
      </section>
    )
  }

  if (entry.slot !== 'taken') return null

  const slotOptions: FieldOption[] = openSlots.map((slot) => ({
    value: slot.id,
    label: `${formatWeekday(slot.startsAt)}, ${formatClock(slot.startsAt)}`,
  }))

  return (
    <section className={CALENDAR_DETAIL.section}>
      <Button variant="danger" disabled={pending} onClick={() => setCancelling(true)}>
        {ANNUAL_REVIEW_COPY.cancelSlot}
      </Button>

      <Dialog
        open={isCancelling}
        size="sm"
        title={ANNUAL_REVIEW_COPY.cancelTitle}
        description={ANNUAL_REVIEW_COPY.cancelLead}
        onClose={() => setCancelling(false)}
        footer={
          <>
            <Button onClick={() => setCancelling(false)}>{ANNUAL_REVIEW_COPY.keep}</Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => {
                setCancelling(false)
                onCancel(null)
              }}
            >
              {ANNUAL_REVIEW_COPY.cancelAnyway}
            </Button>
            <Button
              variant="primary"
              disabled={pending || moveTo === ''}
              onClick={() => {
                setCancelling(false)
                onCancel(moveTo)
              }}
            >
              {ANNUAL_REVIEW_COPY.postpone}
            </Button>
          </>
        }
      >
        {slotOptions.length === 0 ? (
          <p>{ANNUAL_REVIEW_COPY.noOpenSlot}</p>
        ) : (
          <SelectMenu
            label={ANNUAL_REVIEW_COPY.chooseSlot}
            options={slotOptions}
            value={moveTo}
            placeholder={ANNUAL_REVIEW_COPY.chooseSlot}
            onChange={setMoveTo}
          />
        )}
      </Dialog>
    </section>
  )
}
