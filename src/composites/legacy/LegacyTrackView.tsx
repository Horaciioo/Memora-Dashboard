'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { useLegacy } from '@/core/hooks/data/useLegacy'
import { LegacyGauge } from '@/composites/legacy/LegacyGauge'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import { LEGACY_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { ICONS } from '@/declarations/ui/icons'
import { LEGACY_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { LEGACY_FUNCTION_OF } from '@/declarations/reference/fixed'
import { INLINE_EDIT_STYLES, LEGACY_TRACK } from '@/declarations/ui/variants'
import type { LegacyModuleView, LegacyTrackDetail } from '@/types/legacy'
import { LegacyStatuses } from '@/utils/constants/hierarchy'
import type { LegacyStatusName } from '@/utils/constants/hierarchy'
import { formatDay } from '@/utils/format/dates'
import { cn } from '@/utils/classnames'

export interface LegacyTrackViewProps {
  detail: LegacyTrackDetail
  // Evaluator
  canGrade: boolean
  // Administrator
  canDecide: boolean
  // The member following the track
  isOwner: boolean
}

/**
 * The evaluator's note of a module: a click on it turns it into a field
 * @param {Object} props - Note and handler
 * @return {JSX.Element}
 */

const GradeCell = ({
  value,
  disabled,
  onCommit,
}: {
  value: number | null
  disabled: boolean
  onCommit: (score: number) => Promise<boolean>
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const commit = async () => {
    const score = Number(draft)
    if (draft.trim() !== '' && Number.isFinite(score) && score !== value) await onCommit(score)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={(node) => node?.focus()}
        type="number"
        inputMode="numeric"
        min={0}
        max={LEGACY_SETTINGS.modulePoints}
        value={draft}
        aria-label={LEGACY_COPY.gradeTitle}
        className={cn(INLINE_EDIT_STYLES.input, 'w-20 text-right')}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void commit()
          if (event.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <span
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      title={disabled ? undefined : LEGACY_COPY.gradeHint}
      className={cn(!disabled && INLINE_EDIT_STYLES.text)}
      onClick={() => {
        if (disabled) return
        setDraft(value === null ? '' : String(value))
        setEditing(true)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !disabled) {
          setDraft(value === null ? '' : String(value))
          setEditing(true)
        }
      }}
    >
      {value === null ? (
        <span className={INLINE_EDIT_STYLES.placeholder}>{LEGACY_COPY.gradeEmpty}</span>
      ) : (
        value
      )}
    </span>
  )
}

/**
 * One module as a row: its name and score, a bar with the pass mark on it, the exercises and the
 * evaluator's note, and the way into the module for the member
 * @param {Object} props - Module and what the viewer may do
 * @return {JSX.Element}
 */

const ModuleRow = ({
  trackId,
  module,
  canGrade,
  isOwner,
  isRunning,
  onGrade,
}: {
  trackId: string
  module: LegacyModuleView
  canGrade: boolean
  isOwner: boolean
  isRunning: boolean
  onGrade: (moduleKey: string, score: number) => Promise<boolean>
}) => {
  const Check = ICONS.success
  const markAt = (LEGACY_SETTINGS.modulePassPoints / LEGACY_SETTINGS.modulePoints) * 100
  const action =
    module.cleared === 0
      ? LEGACY_COPY.start
      : module.cleared < module.exercises
        ? LEGACY_COPY.resume
        : LEGACY_COPY.review

  return (
    <article className={LEGACY_TRACK.module}>
      <div className={LEGACY_TRACK.moduleHead}>
        <h3 className={LEGACY_TRACK.moduleName}>{module.name}</h3>
        {module.passed && <Check className={LEGACY_TRACK.moduleCheck} aria-hidden="true" />}
      </div>
      <div className={LEGACY_TRACK.moduleScore}>
        <span className={LEGACY_TRACK.scoreFigure}>{module.total}</span>
        <span className={LEGACY_TRACK.scoreMax}>{`/ ${LEGACY_SETTINGS.modulePoints}`}</span>
      </div>

      <div className={LEGACY_TRACK.bar}>
        <span
          className={cn(LEGACY_TRACK.barFill, module.passed && LEGACY_TRACK.barDone)}
          style={{
            width: `${Math.min(100, (module.total / LEGACY_SETTINGS.modulePoints) * 100)}%`,
          }}
        />
        <span className={LEGACY_TRACK.barMark} style={{ left: `${markAt}%` }} />
        <span className={LEGACY_TRACK.barMarkLabel} style={{ left: `${markAt}%` }}>
          {LEGACY_COPY.passMark.replace('{points}', String(LEGACY_SETTINGS.modulePassPoints))}
        </span>
      </div>

      <p className={LEGACY_TRACK.moduleMeta}>
        {LEGACY_COPY.exercisesDone
          .replace('{cleared}', String(module.cleared))
          .replace('{total}', String(module.exercises))}
        {'. '}
        {LEGACY_COPY.evaluatorNote}
        {' : '}
        <GradeCell
          value={module.evaluator}
          disabled={!canGrade || !isRunning}
          onCommit={(score) => onGrade(module.key, score)}
        />
        {'.'}
      </p>

      {isOwner && isRunning && (
        <Link href={ROUTES.legacyModule(trackId, module.key)} className={LEGACY_TRACK.moduleAction}>
          <Button variant={module.cleared >= module.exercises ? 'secondary' : 'primary'}>
            {action}
          </Button>
        </Link>
      )}
    </article>
  )
}

/**
 * One track opened: a dial of the points against the threshold beside the three modules
 * @param {LegacyTrackViewProps} props - Track and permissions
 * @return {JSX.Element}
 */

export const LegacyTrackView = ({ detail, canGrade, canDecide, isOwner }: LegacyTrackViewProps) => {
  const legacy = useLegacy()
  const [deciding, setDeciding] = useState<LegacyStatusName | null>(null)
  const { summary, modules } = detail
  const { outcome } = summary
  const status = LEGACY_STATUS_REGISTRY.get(summary.status)
  const paint = accentPaint(status.accent)
  const isRunning = summary.status === LegacyStatuses.Running
  const Flag = ICONS.deadline
  const Done = ICONS.success
  const Calendar = ICONS.meetings

  const decision: Record<string, { description: string; tone: 'danger' | 'brand' }> = {
    [LegacyStatuses.Passed]: { description: LEGACY_COPY.decidePassDescription, tone: 'brand' },
    [LegacyStatuses.Failed]: { description: LEGACY_COPY.decideFailDescription, tone: 'danger' },
    [LegacyStatuses.Cancelled]: {
      description: LEGACY_COPY.decideCancelDescription,
      tone: 'danger',
    },
  }

  return (
    <div className={LEGACY_TRACK.page}>
      <aside className={LEGACY_TRACK.summary}>
        <div className={LEGACY_TRACK.person}>
          <Avatar name={summary.memberName} src={summary.avatarUrl} size="md" />
          <div>
            <h2 className={LEGACY_TRACK.name}>{summary.memberName}</h2>
            <p className={LEGACY_TRACK.trade}>
              {/* The title worn while the track runs */}
              {(isRunning && summary.functionName
                ? LEGACY_FUNCTION_OF[summary.functionName]
                : null) ??
                summary.functionName ??
                LEGACY_COPY.trade}
            </p>
            {!isRunning && (
              <p className={cn(LEGACY_TRACK.statusClosed, paint.text)} style={paint.style}>
                {status.label}
              </p>
            )}
          </div>
        </div>

        <LegacyGauge
          points={outcome.points}
          max={outcome.maxPoints}
          threshold={outcome.pointsToPass}
        />

        <dl className={LEGACY_TRACK.facts}>
          <div className={LEGACY_TRACK.fact}>
            <Flag className={LEGACY_TRACK.factIcon} aria-hidden="true" />
            <dt className={LEGACY_TRACK.factLabel}>{LEGACY_COPY.missingPoints}</dt>
            <dd className={LEGACY_TRACK.factValue}>
              {Math.max(0, outcome.pointsToPass - outcome.points)}
            </dd>
          </div>
          <div className={LEGACY_TRACK.fact}>
            <Done className={LEGACY_TRACK.factIcon} aria-hidden="true" />
            <dt className={LEGACY_TRACK.factLabel}>{LEGACY_COPY.outcomeModules}</dt>
            <dd className={LEGACY_TRACK.factValue}>
              {LEGACY_COPY.modulesNeeded
                .replace('{done}', String(outcome.modulesPassed))
                .replace('{needed}', String(outcome.modulesToPass))}
            </dd>
          </div>
          <div className={LEGACY_TRACK.fact}>
            <Calendar className={LEGACY_TRACK.factIcon} aria-hidden="true" />
            <dt className={LEGACY_TRACK.factLabel}>{LEGACY_COPY.endsOn}</dt>
            <dd className={LEGACY_TRACK.factValue}>{formatDay(summary.endsAt)}</dd>
          </div>
        </dl>

        {canDecide && isRunning && (
          <div className={LEGACY_TRACK.actions}>
            <Button
              variant="primary"
              icon="confirm"
              disabled={!outcome.eligible || legacy.isSaving}
              onClick={() => setDeciding(LegacyStatuses.Passed)}
            >
              {LEGACY_COPY.decidePass}
            </Button>
            <Button
              icon="close"
              disabled={legacy.isSaving}
              onClick={() => setDeciding(LegacyStatuses.Failed)}
            >
              {LEGACY_COPY.decideFail}
            </Button>
            <Button
              variant="danger"
              icon="remove"
              disabled={legacy.isSaving}
              onClick={() => setDeciding(LegacyStatuses.Cancelled)}
            >
              {LEGACY_COPY.decideCancel}
            </Button>
          </div>
        )}
      </aside>

      <section className={LEGACY_TRACK.modules} aria-label={LEGACY_COPY.modules}>
        {modules.map((module) => (
          <ModuleRow
            key={module.key}
            trackId={summary.id}
            module={module}
            canGrade={canGrade}
            isOwner={isOwner}
            isRunning={isRunning}
            onGrade={(moduleKey, score) => legacy.grade(summary.id, moduleKey, score)}
          />
        ))}
      </section>

      <ConfirmDialog
        open={deciding !== null}
        title={LEGACY_COPY.decideTitle}
        description={deciding ? (decision[deciding]?.description ?? '') : ''}
        tone={deciding ? decision[deciding]?.tone : undefined}
        pending={legacy.isSaving}
        onCancel={() => setDeciding(null)}
        onConfirm={async () => {
          if (deciding) await legacy.decide(summary.id, deciding)
          setDeciding(null)
        }}
      />
    </div>
  )
}
