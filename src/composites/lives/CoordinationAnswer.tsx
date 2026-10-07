'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/Input'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_COORDINATION_COPY } from '@/declarations/lives/copy'
import { LIVE_COORDINATION } from '@/declarations/ui/variants'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { CoordinationRequest, LiveGap } from '@/types/lives'
import { formatClock, formatDayTime, toDateTimeInput } from '@/utils/format/dates'

export interface CoordinationAnswerProps {
  request: CoordinationRequest
}

/**
 * Answer to one request to coordinate: two time fields starting on the whole live, accept or
 * decline
 * @param {CoordinationRequest} request - Live asking
 * @return {JSX.Element}
 */

export const CoordinationAnswer = ({ request }: CoordinationAnswerProps) => {
  const router = useRouter()
  const { run, isSaving } = useMutation()
  const { notify } = useNotifications()
  const [from, setFrom] = useState(toDateTimeInput(request.startsAt))
  const [to, setTo] = useState(toDateTimeInput(request.endsAt))

  const answer = async (accept: boolean) => {
    const result = await run(
      () =>
        apiPost<{ gaps: LiveGap[] }>(API_ROUTES.liveCoordination(request.liveId), {
          accept,
          startsAt: from ? new Date(from).toISOString() : null,
          endsAt: to ? new Date(to).toISOString() : null,
        }),
      accept ? LIVE_COORDINATION_COPY.accepted : LIVE_COORDINATION_COPY.declined
    )
    if (!result) return

    // The hole left in the live is told right away
    if (result.gaps.length > 0) {
      const ranges = result.gaps
        .map((gap) =>
          LIVE_COORDINATION_COPY.gapRange
            .replace('{from}', formatClock(gap.from))
            .replace('{to}', formatClock(gap.to))
        )
        .join(', ')
      notify({
        tone: 'caution',
        title: LIVE_COORDINATION_COPY.gapAlert.replace('{ranges}', ranges),
      })
    }
    router.refresh()
  }

  const lead = (
    request.askedBy ? LIVE_COORDINATION_COPY.lead : LIVE_COORDINATION_COPY.leadAnonymous
  )
    .replace('{asker}', request.askedBy ?? '')
    .replace('{creator}', request.creator)
    .replace('{title}', request.title)

  return (
    <div className={LIVE_COORDINATION.answer}>
      <p className={LIVE_COORDINATION.lead}>{lead}</p>
      <p className={LIVE_COORDINATION.meta}>
        {LIVE_COORDINATION_COPY.window.replace(
          '{range}',
          `${formatDayTime(request.startsAt)} → ${formatClock(request.endsAt)}`
        )}
      </p>

      <div className={LIVE_COORDINATION.times}>
        <label className={LIVE_COORDINATION.timeField}>
          <span className={LIVE_COORDINATION.timeLabel}>{LIVE_COORDINATION_COPY.from}</span>
          <Input
            type="datetime-local"
            value={from}
            min={toDateTimeInput(request.startsAt)}
            max={toDateTimeInput(request.endsAt)}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className={LIVE_COORDINATION.timeField}>
          <span className={LIVE_COORDINATION.timeLabel}>{LIVE_COORDINATION_COPY.to}</span>
          <Input
            type="datetime-local"
            value={to}
            min={toDateTimeInput(request.startsAt)}
            max={toDateTimeInput(request.endsAt)}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
      </div>

      <div className={LIVE_COORDINATION.actions}>
        <Button variant="primary" isLoading={isSaving} onClick={() => void answer(true)}>
          {LIVE_COORDINATION_COPY.accept}
        </Button>
        <Button disabled={isSaving} onClick={() => void answer(false)}>
          {LIVE_COORDINATION_COPY.decline}
        </Button>
      </div>
    </div>
  )
}
