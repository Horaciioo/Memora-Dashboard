'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Button } from '@/components/elements/actions/Button'
import { AddRow } from '@/components/structures/AddRow'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { PageOptions, type PageOption } from '@/components/structures/PageOptions'
import { Section } from '@/components/structures/Section'
import { useLegacy } from '@/core/hooks/data/useLegacy'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import { LEGACY_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { accentPaint } from '@/declarations/ui/theme'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { LEGACY_BOARD } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { LegacyTrackSummary } from '@/types/legacy'
import { cn } from '@/utils/classnames'
import { LegacyStatuses } from '@/utils/constants/hierarchy'
import { formatDay } from '@/utils/format/dates'

export interface LegacyBoardProps {
  tracks: LegacyTrackSummary[]
  fields: FieldDefinition[]
  canManage: boolean
}

/**
 * One track as a row: who, the points against the threshold on a bar, where it stands
 * @param {Object} props - Track
 * @return {JSX.Element}
 */

const TrackRow = ({ track }: { track: LegacyTrackSummary }) => {
  const status = LEGACY_STATUS_REGISTRY.get(track.status)
  const paint = accentPaint(status.accent)
  const { outcome } = track
  const share = (value: number) => `${Math.min(100, (value / outcome.maxPoints) * 100)}%`

  return (
    <li>
      <Link href={ROUTES.legacyTrack(track.id)} className={LEGACY_BOARD.row}>
        <Avatar name={track.memberName} src={track.avatarUrl} size="md" />
        <span className={LEGACY_BOARD.person}>
          <span className={LEGACY_BOARD.name}>{track.memberName}</span>
          <span className={LEGACY_BOARD.meta}>
            {`${track.functionName ?? LEGACY_COPY.trade}, ${formatDay(track.startsAt)} → ${formatDay(track.endsAt)}`}
          </span>
        </span>
        <span className={LEGACY_BOARD.score}>
          <span className={LEGACY_BOARD.scoreTrack}>
            <span
              className={cn(LEGACY_BOARD.scoreFill, outcome.eligible && LEGACY_BOARD.scoreFillDone)}
              style={{ width: share(outcome.points) }}
            />
            <span
              className={LEGACY_BOARD.scoreMark}
              style={{ left: share(outcome.pointsToPass) }}
            />
          </span>
          <span className={LEGACY_BOARD.scoreFigure}>{outcome.points}</span>
        </span>
        <span className={cn(LEGACY_BOARD.status, paint.text)} style={paint.style}>
          {status.label}
        </span>
      </Link>
    </li>
  )
}

/**
 * Every Legacy track
 * @param {LegacyBoardProps} props - Tracks
 * @return {JSX.Element}
 */

export const LegacyBoard = ({ tracks, fields, canManage }: LegacyBoardProps) => {
  const legacy = useLegacy()
  const [opening, setOpening] = useState(false)
  const [showFinished, setShowFinished] = useState(false)

  // Running tracks first
  const [running, finished] = useMemo(
    () => [
      tracks.filter((track) => track.status === LegacyStatuses.Running),
      tracks.filter((track) => track.status !== LegacyStatuses.Running),
    ],
    [tracks]
  )

  const pageOptions: PageOption[] =
    finished.length > 0
      ? [
          {
            id: 'finished',
            label: PAGE_OPTIONS_COPY.showFinished,
            checked: showFinished,
            onChange: setShowFinished,
          },
        ]
      : []

  const openForm = () => {
    legacy.clearIssues()
    setOpening(true)
  }

  return (
    <div className={LEGACY_BOARD.page}>
      {tracks.length === 0 ? (
        <EmptyState
          figure="academy"
          title={LEGACY_COPY.emptyTitle}
          description={LEGACY_COPY.emptyDescription}
          action={
            <Button variant="primary" icon="add" disabled={!canManage} onClick={openForm}>
              {LEGACY_COPY.openTitle}
            </Button>
          }
        />
      ) : (
        <>
          <PageOptions options={pageOptions} />
          <Section title={LEGACY_COPY.groupRunning} bare>
            {running.length === 0 ? (
              <p className={LEGACY_BOARD.empty}>{LEGACY_COPY.noneRunning}</p>
            ) : (
              <ul className={LEGACY_BOARD.list}>
                {running.map((track) => (
                  <TrackRow key={track.id} track={track} />
                ))}
              </ul>
            )}
            {canManage && <AddRow label={LEGACY_COPY.openTitle} onClick={openForm} />}
          </Section>

          {showFinished && finished.length > 0 && (
            <Section title={LEGACY_COPY.groupFinished} bare>
              <ul className={LEGACY_BOARD.list}>
                {finished.map((track) => (
                  <TrackRow key={track.id} track={track} />
                ))}
              </ul>
            </Section>
          )}
        </>
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.legacy}
        open={opening}
        title={LEGACY_COPY.openTitle}
        fields={fields}
        issues={legacy.issues}
        isSaving={legacy.isSaving}
        onSubmit={legacy.open}
        onClose={() => setOpening(false)}
      />
    </div>
  )
}
