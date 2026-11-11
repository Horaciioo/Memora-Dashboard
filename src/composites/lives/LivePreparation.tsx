'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { AttendanceHoursDialog } from '@/composites/calendar/attendance/AttendanceHoursDialog'
import { Markdown } from '@/components/elements/display/Markdown'
import { LiveCoordinator } from '@/composites/lives/coordination/LiveCoordinator'
import { LiveRosterBoard } from '@/composites/lives/LiveRosterBoard'
import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_COPY, LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { LIVE_GATE, LIVE_PREPARATION } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import { initialHours } from '@/utils/format/time/hours'

export interface LivePreparationProps {
  live: LiveView
  canEdit: boolean
}

/**
 * Planned live desk
 * @param {LivePreparationProps} props - Live preparation data
 * @return {JSX.Element} - Coordination workspace
 */

export const LivePreparation = ({ live, canEdit }: LivePreparationProps) => {
  const [attendance, setAttendance] = useState(live.myAttendance)
  const [hoursOpen, setHoursOpen] = useState(false)
  const [instructions, setInstructions] = useState(live.instructions)
  const client = useQueryClient()
  const { run, isSaving } = useMutation()

  const answer = async (status: AttendanceStatusName, hours?: { from: string; to: string }) => {
    const saved = await run(() => apiPost(API_ROUTES.liveRoster(live.id), { status, ...hours }))
    if (!saved) return

    setAttendance(status)
    setHoursOpen(false)
    await client.invalidateQueries({ queryKey: QUERY_KEYS.liveRoster(live.id) })
  }

  const saveInstructions = async (value: string) => {
    const saved = await run(
      () => apiPatch<LiveView>(API_ROUTES.liveInstructions(live.id), { instructions: value }),
      LIVE_PAGE_COPY.instructionsSaved
    )
    if (saved) setInstructions(saved.instructions)

    return saved !== null
  }

  return (
    <section className={LIVE_PREPARATION.root}>
      <div className={LIVE_PREPARATION.grid}>
        <section className={LIVE_PREPARATION.card}>
          <h4 className={LIVE_PREPARATION.title}>{LIVE_COPY.coordinators}</h4>
          <LiveCoordinator
            seats={live.coordinators}
            gaps={live.gaps}
            editLiveId={canEdit ? live.id : undefined}
          />
        </section>

        <section className={LIVE_PREPARATION.card}>
          <LiveRosterBoard liveId={live.id} />
          <div className={LIVE_GATE.presence}>
            <h3 className={LIVE_GATE.label}>{LIVE_PAGE_COPY.presenceTitle}</h3>
            <div className={LIVE_GATE.choices}>
              <Button
                variant={attendance === AttendanceStatuses.Present ? 'success' : 'secondary'}
                disabled={isSaving}
                onClick={() => setHoursOpen(true)}
                aria-pressed={attendance === AttendanceStatuses.Present}
              >
                {LIVE_PAGE_COPY.presencePresent}
              </Button>
              <Button
                variant={attendance === AttendanceStatuses.Absent ? 'danger' : 'secondary'}
                disabled={isSaving}
                onClick={() => void answer(AttendanceStatuses.Absent)}
                aria-pressed={attendance === AttendanceStatuses.Absent}
              >
                {LIVE_PAGE_COPY.presenceAbsent}
              </Button>
            </div>
            {hoursOpen && (
              <AttendanceHoursDialog
                initial={initialHours(live.myHours, {
                  startsAt: live.plannedStartAt,
                  endsAt: live.plannedEndAt,
                })}
                isSaving={isSaving}
                onClose={() => setHoursOpen(false)}
                onConfirm={(hours) => void answer(AttendanceStatuses.Present, hours)}
              />
            )}
          </div>
        </section>

        <section className={LIVE_PREPARATION.card}>
          <h4 className={LIVE_PREPARATION.title}>{LIVE_PAGE_COPY.instructionsTitle}</h4>
          {canEdit ? (
            <div className={LIVE_PREPARATION.instructions}>
              <InlineMarkdown
                id={`live-instructions-${live.id}`}
                value={instructions}
                placeholder={LIVE_PAGE_COPY.instructionsEmpty}
                maxLength={FORM_SETTINGS.markdownMaxLength}
                onCommit={saveInstructions}
              />
            </div>
          ) : instructions ? (
            <div className={LIVE_PREPARATION.instructions}>
              <Markdown source={instructions} />
            </div>
          ) : (
            <p className={LIVE_PREPARATION.instructionsEmpty}>{LIVE_PAGE_COPY.instructionsEmpty}</p>
          )}
        </section>
      </div>
    </section>
  )
}
