'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import { PARKOUR_COPY, PARKOUR_PHASES } from '@/declarations/academy/parkour'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { PARKOUR_PANEL } from '@/declarations/ui/variants'
import type { ParkourView } from '@/types/academy'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

// Phases a resignation can still end
const RUNNING_PHASES = new Set([
  'awaitingInfo',
  'ready',
  'periodOne',
  'reviewOneDue',
  'reviewOneSubmitted',
  'periodOneDone',
  'periodTwo',
  'reviewTwoDue',
  'reviewTwoSubmitted',
  'periodThree',
  'finalReviewDue',
  'finalReviewSubmitted',
])

export interface ParkourPanelProps {
  parkour: ParkourView
  canManage: boolean
}

/**
 * Where a junior stands on the AcademicParkour, with the next gesture at hand
 * @param {ParkourView} parkour - Parkour view
 * @param {boolean} canManage - Viewer pilots the academy
 * @return {JSX.Element}
 */

export const ParkourPanel = ({ parkour, canManage }: ParkourPanelProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const copy = useCopy(PARKOUR_COPY.copyLink)
  const [isResigning, setResigning] = useState(false)

  const phase = PARKOUR_PHASES[parkour.phase]
  const Glyph = ICONS[phase.icon]
  const lead = phase.lead
    .replace('{lives}', String(parkour.livesNeeded ?? ''))
    .replace('{deadline}', parkour.deadlineAt ? formatDay(parkour.deadlineAt) : '')

  // Every gesture rereads the page, the whole file moves with it
  const act = async (path: string, body: object, success: string) => {
    const done = await run(() => apiPost(path, body), success)
    if (done) router.refresh()

    return done !== null
  }

  return (
    <section className={PARKOUR_PANEL.root} aria-label={PARKOUR_COPY.title}>
      <header className={PARKOUR_PANEL.head}>
        <div className={PARKOUR_PANEL.title}>
          <span className={PARKOUR_PANEL.eyebrow}>{PARKOUR_COPY.title}</span>
          <h2 className={cn(PARKOUR_PANEL.phase, TONES[phase.tone].text)}>
            <Glyph className={PARKOUR_PANEL.glyph} aria-hidden="true" />
            {phase.label}
          </h2>
        </div>
        {parkour.livesNeeded !== null && (
          <span className={PARKOUR_PANEL.lives}>
            <span className={PARKOUR_PANEL.livesValue}>
              {PARKOUR_COPY.livesOf
                .replace('{count}', String(parkour.liveCount))
                .replace('{needed}', String(parkour.livesNeeded))}
            </span>
            <span className={PARKOUR_PANEL.hint}>{PARKOUR_COPY.lives}</span>
          </span>
        )}
      </header>

      <p className={PARKOUR_PANEL.lead}>{lead}</p>

      {parkour.integrationPath && (
        <div className={PARKOUR_PANEL.link}>
          <span className="min-w-0 flex-1">{parkour.integrationPath}</span>
          <Button
            variant="ghost"
            icon="copy"
            onClick={() => void copy(`${window.location.origin}${parkour.integrationPath}`)}
          >
            {PARKOUR_COPY.copyLink}
          </Button>
        </div>
      )}

      {canManage && (
        <div className={PARKOUR_PANEL.actions}>
          {parkour.phase === 'needsKickoff' && (
            <Button
              variant="primary"
              icon="link"
              isLoading={isSaving}
              onClick={() =>
                void act(
                  API_ROUTES.juniorParkour(parkour.juniorId),
                  { action: 'kickoff' },
                  PARKOUR_COPY.kickoffDeclared
                )
              }
            >
              {PARKOUR_COPY.declareKickoff}
            </Button>
          )}

          {parkour.canLaunchAnyway && (
            <Button
              variant="secondary"
              icon="climb"
              isLoading={isSaving}
              title={PARKOUR_COPY.launchAnywayHint}
              onClick={() =>
                void act(API_ROUTES.sessionLaunch(parkour.sessionId), {}, PARKOUR_COPY.launched)
              }
            >
              {PARKOUR_COPY.launchAnyway}
            </Button>
          )}

          {parkour.canOpenSecondPeriod && (
            <Button
              variant="secondary"
              icon="climb"
              isLoading={isSaving}
              title={PARKOUR_COPY.openSecondPeriodHint}
              onClick={() =>
                void act(
                  API_ROUTES.sessionSecondPeriod(parkour.sessionId),
                  {},
                  PARKOUR_COPY.secondPeriodOpened
                )
              }
            >
              {PARKOUR_COPY.openSecondPeriod}
            </Button>
          )}

          {RUNNING_PHASES.has(parkour.phase) && (
            <Button variant="ghost" icon="close" onClick={() => setResigning(true)}>
              {PARKOUR_COPY.resign}
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={isResigning}
        title={PARKOUR_COPY.resignTitle}
        description={PARKOUR_COPY.resignDescription}
        tone="danger"
        pending={isSaving}
        onCancel={() => setResigning(false)}
        onConfirm={async () => {
          await act(
            API_ROUTES.juniorParkour(parkour.juniorId),
            { action: 'resign' },
            PARKOUR_COPY.resigned
          )
          setResigning(false)
        }}
      />
    </section>
  )
}
