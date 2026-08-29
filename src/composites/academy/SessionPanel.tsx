'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FileTabs } from '@/components/structures/FileTabs'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { WipNotice } from '@/components/structures/WipNotice'
import { CalendarBoard } from '@/composites/calendar/CalendarBoard'
import { useSession } from '@/core/hooks/data/useAcademy'
import type { TimelineStepState } from '@/core/services/academy/timeline'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_STAGE_REGISTRY,
  ACADEMY_STEP_KIND_REGISTRY,
  ACADEMY_JUNIOR_STATUS_REGISTRY,
  STEP_OWNER_REGISTRY,
} from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { toTone, type Tone } from '@/declarations/ui/theme'
import { LIST_STYLES, TIMELINE_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { AcademyStageName } from '@/utils/constants/hierarchy'
import type { AcademyStepView, JuniorView, SessionDetail } from '@/types/academy'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldDefinition } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { formatDay, formatDayTime } from '@/utils/format/dates'

// Tone carried by each resolved timeline state
const STATE_TONES: Record<TimelineStepState, Tone> = {
  done: 'success',
  late: 'danger',
  current: 'warning',
  idle: 'neutral',
}

// Copy carried by each resolved timeline state
const STATE_LABELS: Record<TimelineStepState, string> = {
  done: ACADEMY_COPY.stateDone,
  late: ACADEMY_COPY.stateLate,
  current: ACADEMY_COPY.stateCurrent,
  idle: ACADEMY_COPY.stateIdle,
}

// A thread moment always carries a kind, a timeline step never does
const isThreadStep = (
  step: AcademyStepView
): step is AcademyStepView & { kind: NonNullable<AcademyStepView['kind']> } => step.stage === null

// A timeline step always carries the stage it was instantiated for
const isTimelineStep = (
  step: AcademyStepView
): step is AcademyStepView & { stage: AcademyStageName } => step.stage !== null

/**
 * Order two timeline steps by stage, then by their day or live offset
 * @param {AcademyStepView & { stage: AcademyStageName }} a - First step
 * @param {AcademyStepView & { stage: AcademyStageName }} b - Second step
 * @return {number} - Comparator result
 */

const byStagePosition = (
  a: AcademyStepView & { stage: AcademyStageName },
  b: AcademyStepView & { stage: AcademyStageName }
): number => {
  const stageDiff =
    ACADEMY_STAGE_REGISTRY.keys.indexOf(a.stage) - ACADEMY_STAGE_REGISTRY.keys.indexOf(b.stage)

  return stageDiff !== 0 ? stageDiff : (a.offset ?? 0) - (b.offset ?? 0)
}

/**
 * Steps of the same stage blocked behind an earlier late one
 * @param {(AcademyStepView & { stage: AcademyStageName })[]} steps - One group, already ordered
 * @return {Set<string>} - Blocked step identifiers
 */

const blockedIds = (steps: (AcademyStepView & { stage: AcademyStageName })[]): Set<string> => {
  const blocked = new Set<string>()
  const byStage = new Map<AcademyStageName, (AcademyStepView & { stage: AcademyStageName })[]>()

  for (const step of steps) byStage.set(step.stage, [...(byStage.get(step.stage) ?? []), step])

  for (const group of byStage.values()) {
    let lateSeen = false
    for (const step of group) {
      if (lateSeen && step.validatedAt === null) blocked.add(step.id)
      if (step.state === 'late') lateSeen = true
    }
  }

  return blocked
}

export interface SessionPanelProps {
  detail: SessionDetail
  juniorFields: FieldDefinition[]
  stepFields: FieldDefinition[]
  hasCandidates: boolean
  canManage: boolean
  calendarEntries: CalendarEntry[]
  calendarFields: FieldDefinition[]
  calendarAnchor: string
  canManageCalendar: boolean
}

/**
 * One session — juniors, timeline, calendar, missions and the free thread
 * @param {SessionDetail} detail - Session resolved server-side
 * @param {FieldDefinition[]} juniorFields - Declarations of the junior form
 * @param {FieldDefinition[]} stepFields - Declarations of the thread form
 * @param {boolean} hasCandidates - At least one moderator may still be taken in
 * @param {boolean} canManage - Member may drive the session
 * @param {CalendarEntry[]} calendarEntries - Calendar window resolved server-side
 * @param {FieldDefinition[]} calendarFields - Declarations of the calendar entry form
 * @param {string} calendarAnchor - ISO day the calendar grid opens on
 * @param {boolean} canManageCalendar - Member may post and move calendar entries
 * @return {JSX.Element}
 */

export const SessionPanel = ({
  detail,
  juniorFields,
  stepFields,
  hasCandidates,
  canManage,
  calendarEntries,
  calendarFields,
  calendarAnchor,
  canManageCalendar,
}: SessionPanelProps) => {
  const router = useRouter()
  const session = useSession(detail.summary.id, detail.juniors, detail.steps)
  const { contextMenu } = useMenu()
  const [dialog, setDialog] = useState<'junior' | 'step' | null>(null)
  const [editingJunior, setEditingJunior] = useState<JuniorView | null>(null)
  const [editingStep, setEditingStep] = useState<AcademyStepView | null>(null)
  const [pendingJunior, setPendingJunior] = useState<JuniorView | null>(null)
  const [pendingStep, setPendingStep] = useState<AcademyStepView | null>(null)

  const threadSteps = session.steps.filter(isThreadStep)
  const timelineSteps = session.steps.filter(isTimelineStep).sort(byStagePosition)
  const sessionWideSteps = timelineSteps.filter((step) => step.juniorId === null)
  const juniorGroups = session.juniors
    .map((junior) => ({
      junior,
      steps: timelineSteps.filter((step) => step.juniorId === junior.id),
    }))
    .filter((group) => group.steps.length > 0)
  const blocked = blockedIds([sessionWideSteps, ...juniorGroups.map((group) => group.steps)].flat())

  const openJunior = (junior: JuniorView | null) => {
    session.clearIssues()
    setEditingJunior(junior)
    setDialog('junior')
  }

  const openStep = (step: AcademyStepView | null) => {
    session.clearIssues()
    setEditingStep(step)
    setDialog('step')
  }

  const juniorMenu = (junior: JuniorView): MenuItem[] => [
    {
      id: 'open',
      label: ACADEMY_COPY.fileTitle,
      icon: 'sheet',
      onSelect: () => router.push(ROUTES.junior(detail.summary.id, junior.id)),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => openJunior(junior),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingJunior(junior),
    },
  ]

  const stepMenu = (step: AcademyStepView): MenuItem[] => [
    {
      id: 'done',
      label: step.doneAt ? ACADEMY_COPY.markPlanned : ACADEMY_COPY.markDone,
      icon: step.doneAt ? 'clock' : 'confirm',
      disabled: !canManage,
      onSelect: () => void session.setStepDone(step.id, step.doneAt === null),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => openStep(step),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingStep(step),
    },
  ]

  const juniorsTab = () => (
    <Section description={ACADEMY_COPY.juniorsLead} bare>
      {session.juniors.length === 0 ? (
        <EmptyState
          figure="academy"
          title={hasCandidates ? ACADEMY_COPY.juniorEmptyTitle : ACADEMY_COPY.noMembersTitle}
          description={
            hasCandidates ? ACADEMY_COPY.juniorEmptyDescription : ACADEMY_COPY.noMembersDescription
          }
          action={
            hasCandidates ? (
              <Button
                variant="primary"
                icon="add"
                disabled={!canManage}
                onClick={() => openJunior(null)}
              >
                {ACADEMY_COPY.juniorAdd}
              </Button>
            ) : (
              <Button variant="primary" icon="members" onClick={() => router.push(ROUTES.members)}>
                {ACADEMY_COPY.openMembers}
              </Button>
            )
          }
        />
      ) : (
        <div className={LIST_STYLES.stack}>
          {session.juniors.map((junior) => {
            const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)

            return (
              <div
                key={junior.id}
                onClick={() => router.push(ROUTES.junior(detail.summary.id, junior.id))}
                onContextMenu={contextMenu(juniorMenu(junior), junior.displayName)}
                className={cn(LIST_STYLES.item, LIST_STYLES.itemClickable)}
              >
                <Avatar name={junior.displayName} src={junior.avatarUrl} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium">{junior.displayName}</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      label={junior.dispositif.name}
                      accent={junior.dispositif.accent}
                      tone={'info'}
                    />
                    <Badge label={status.label} accent={status.accent} tone={'neutral'} dot />
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {junior.trainer?.name ?? ACADEMY_COPY.noTrainer}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-xs text-[var(--color-ink-subtle)] tabular-nums">
                  {`${junior.completedCount} / ${junior.trainings.length} · ${junior.liveCount} ${ACADEMY_COPY.lives}`}
                </span>
              </div>
            )
          })}
          <AddRow
            label={ACADEMY_COPY.juniorAdd}
            disabled={!canManage || !hasCandidates}
            onClick={() => openJunior(null)}
          />
        </div>
      )}
    </Section>
  )

  const threadTab = () => (
    <Section description={ACADEMY_COPY.threadLead} bare>
      {threadSteps.length === 0 ? (
        <EmptyState
          figure="notes"
          title={ACADEMY_COPY.eventEmptyTitle}
          description={ACADEMY_COPY.eventEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canManage}
              onClick={() => openStep(null)}
            >
              {ACADEMY_COPY.eventAdd}
            </Button>
          }
        />
      ) : (
        <div className={LIST_STYLES.stack}>
          <ol className={TIMELINE_STYLES.list}>
            {threadSteps.map((step) => {
              const kind = ACADEMY_STEP_KIND_REGISTRY.get(step.kind)
              const tone = toTone(kind.accent, 'neutral')

              return (
                <li
                  key={step.id}
                  onContextMenu={contextMenu(stepMenu(step), step.title)}
                  className={TIMELINE_STYLES.item}
                >
                  <span className={TIMELINE_STYLES.rail} aria-hidden="true" />
                  <span
                    className={cn(TIMELINE_STYLES.dot, step.doneAt ? 'bg-current' : '')}
                    aria-hidden="true"
                  />
                  <span className={TIMELINE_STYLES.body}>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge label={kind.label} tone={tone} icon={kind.icon} />
                      <span className="font-medium">{step.title}</span>
                      <Badge
                        label={step.doneAt ? ACADEMY_COPY.eventDone : ACADEMY_COPY.eventPlanned}
                        tone={step.doneAt ? 'success' : 'warning'}
                        dot
                      />
                    </span>
                    <span className={TIMELINE_STYLES.meta}>
                      {[formatDayTime(step.scheduledAt), step.juniorName, step.authorName]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    {step.notes && (
                      <span className="text-sm whitespace-pre-wrap">{step.notes}</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
          <AddRow
            label={ACADEMY_COPY.eventAdd}
            disabled={!canManage}
            onClick={() => openStep(null)}
          />
        </div>
      )}
    </Section>
  )

  const renderTimelineStep = (step: AcademyStepView & { stage: AcademyStageName }) => {
    const state = step.state ?? 'idle'
    const isValidated = step.validatedAt !== null

    return (
      <li key={step.id} className={TIMELINE_STYLES.item}>
        <span className={TIMELINE_STYLES.rail} aria-hidden="true" />
        <span
          className={cn(TIMELINE_STYLES.dot, isValidated ? 'bg-current' : '')}
          aria-hidden="true"
        />
        <span className={TIMELINE_STYLES.body}>
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{step.title}</span>
            <Badge label={ACADEMY_STAGE_REGISTRY.label(step.stage)} tone="neutral" dot />
            <Badge label={STATE_LABELS[state]} tone={STATE_TONES[state]} />
            {canManage && (
              <Button
                variant="icon"
                icon={isValidated ? 'close' : 'confirm'}
                aria-label={isValidated ? ACADEMY_COPY.stepReopen : ACADEMY_COPY.stepValidate}
                className="ml-auto"
                disabled={!isValidated && blocked.has(step.id)}
                onClick={() => void session.setStepValidated(step.id, !isValidated)}
              />
            )}
          </span>
          <span className={TIMELINE_STYLES.meta}>
            {[
              step.scheduledAt ? formatDay(step.scheduledAt) : null,
              step.owner ? STEP_OWNER_REGISTRY.label(step.owner) : null,
              step.validatedByName,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {step.notes && <span className="text-sm whitespace-pre-wrap">{step.notes}</span>}
        </span>
      </li>
    )
  }

  const timelineTab = () => (
    <Section description={ACADEMY_COPY.timelineLead} bare>
      {timelineSteps.length === 0 ? (
        <EmptyState
          figure="academy"
          title={ACADEMY_COPY.timelineEmptyTitle}
          description={ACADEMY_COPY.timelineEmptyDescription}
          action={
            <Link href={ROUTES.settingsSection('etapes-pim')}>
              <Button variant="primary" icon="settings">
                {ACADEMY_COPY.configure}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {sessionWideSteps.length > 0 && (
            <article className={LIST_STYLES.card}>
              <header className="flex items-center gap-2">
                <span className="font-medium">{ACADEMY_COPY.timelineSessionWide}</span>
              </header>
              <ol className={TIMELINE_STYLES.list}>{sessionWideSteps.map(renderTimelineStep)}</ol>
            </article>
          )}
          {juniorGroups.map((group) => (
            <article key={group.junior.id} className={LIST_STYLES.card}>
              <header
                className="flex cursor-pointer items-center gap-2"
                onClick={() => router.push(ROUTES.junior(detail.summary.id, group.junior.id))}
              >
                <Avatar name={group.junior.displayName} src={group.junior.avatarUrl} />
                <span className="font-medium">{group.junior.displayName}</span>
                <Badge
                  label={group.junior.dispositif.name}
                  accent={group.junior.dispositif.accent}
                  tone={'info'}
                />
              </header>
              <ol className={TIMELINE_STYLES.list}>{group.steps.map(renderTimelineStep)}</ol>
            </article>
          ))}
        </div>
      )}
    </Section>
  )

  const missionsTab = () => <WipNotice figure="tasks" />

  const calendarTab = () => (
    <CalendarBoard
      initialEntries={calendarEntries}
      fields={calendarFields}
      anchor={calendarAnchor}
      canManage={canManageCalendar}
      sessionId={detail.summary.id}
    />
  )

  return (
    <>
      <FileTabs
        label={ACADEMY_COPY.title}
        tabs={[
          {
            value: 'juniors',
            label: ACADEMY_COPY.tabJuniors,
            icon: 'members',
            render: juniorsTab,
          },
          {
            value: 'timeline',
            label: ACADEMY_COPY.tabTimeline,
            icon: 'history',
            render: timelineTab,
          },
          {
            value: 'calendar',
            label: ACADEMY_COPY.tabCalendar,
            icon: 'meetings',
            render: calendarTab,
          },
          {
            value: 'missions',
            label: ACADEMY_COPY.tabMissions,
            icon: 'tasks',
            render: missionsTab,
          },
          {
            value: 'thread',
            label: ACADEMY_COPY.tabThread,
            icon: 'note',
            render: threadTab,
          },
        ]}
      />

      <FormDialog
        open={dialog === 'junior'}
        title={editingJunior ? editingJunior.displayName : ACADEMY_COPY.juniorAdd}
        description={formatDay(detail.summary.startsAt)}
        fields={juniorFields}
        initialValues={editingJunior?.values}
        issues={session.issues}
        isSaving={session.isSaving}
        size="lg"
        onSubmit={(values) =>
          editingJunior ? session.editJunior(editingJunior.id, values) : session.addJunior(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'step'}
        title={editingStep ? editingStep.title : ACADEMY_COPY.eventAdd}
        fields={stepFields}
        initialValues={editingStep?.values}
        issues={session.issues}
        isSaving={session.isSaving}
        size="lg"
        onSubmit={(values) =>
          editingStep ? session.editStep(editingStep.id, values) : session.addStep(values)
        }
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={pendingJunior !== null}
        title={ACADEMY_COPY.juniorDeleteTitle}
        description={ACADEMY_COPY.juniorDeleteDescription}
        pending={session.isSaving}
        onCancel={() => setPendingJunior(null)}
        onConfirm={async () => {
          await session.dropJunior(pendingJunior!.id)
          setPendingJunior(null)
        }}
      />

      <ConfirmDialog
        open={pendingStep !== null}
        title={ACADEMY_COPY.eventDeleteTitle}
        description={ACADEMY_COPY.eventDeleteDescription}
        pending={session.isSaving}
        onCancel={() => setPendingStep(null)}
        onConfirm={async () => {
          await session.dropStep(pendingStep!.id)
          setPendingStep(null)
        }}
      />
    </>
  )
}
