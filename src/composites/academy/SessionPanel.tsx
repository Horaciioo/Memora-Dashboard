'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { StatusText } from '@/components/elements/display/StatusText'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FileTabs } from '@/components/structures/FileTabs'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
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
  ACADEMY_SESSION_STATUS_REGISTRY,
  STEP_OWNER_REGISTRY,
} from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_STYLES, RECORD_ROW, SESSION_CARD, SESSION_HERO } from '@/declarations/ui/variants'
import { STAGE_LIST } from '@/declarations/ui/blocks'
import { AcademyJuniorStatuses, AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { AcademyStageName } from '@/utils/constants/hierarchy'
import type { AcademyStepView, JuniorView, SessionDetail } from '@/types/academy'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldDefinition } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { formatDay, formatDayTime } from '@/utils/format/dates'

// Chip carried by each resolved timeline state
const STEP_CHIPS: Record<TimelineStepState, string> = {
  done: STAGE_LIST.stageChipDone,
  late: STAGE_LIST.stageChipLate,
  current: STAGE_LIST.stageChip,
  idle: STAGE_LIST.stageChipOff,
}

// Box holding one group of steps
const TIMELINE_BOX = SESSION_CARD.group

// A thread moment always carries a kind
const isThreadStep = (
  step: AcademyStepView
): step is AcademyStepView & { kind: NonNullable<AcademyStepView['kind']> } => step.stage === null

// A timeline step always carries the stage it was instantiated for
const isTimelineStep = (
  step: AcademyStepView
): step is AcademyStepView & { stage: AcademyStageName } => step.stage !== null

/**
 * Order two timeline steps by stage
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
 * @param {(AcademyStepView & { stage: AcademyStageName })[]} steps - One group
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
 * One session — juniors
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
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.sessionJuniors }}>
      <Section bare>
        {session.juniors.length === 0 ? (
          <EmptyState
            figure="academy"
            title={hasCandidates ? ACADEMY_COPY.juniorEmptyTitle : ACADEMY_COPY.noMembersTitle}
            description={
              hasCandidates
                ? ACADEMY_COPY.juniorEmptyDescription
                : ACADEMY_COPY.noMembersDescription
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
                <Button
                  variant="primary"
                  icon="members"
                  onClick={() => router.push(ROUTES.members)}
                >
                  {ACADEMY_COPY.openMembers}
                </Button>
              )
            }
          />
        ) : (
          <div className={SESSION_CARD.grid}>
            {session.juniors.map((junior) => {
              const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)
              const isActive = junior.status === AcademyJuniorStatuses.Active
              const progress =
                junior.trainings.length > 0
                  ? (junior.completedCount / junior.trainings.length) * 100
                  : null

              return (
                <article
                  key={junior.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(ROUTES.junior(detail.summary.id, junior.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter')
                      router.push(ROUTES.junior(detail.summary.id, junior.id))
                  }}
                  onContextMenu={contextMenu(juniorMenu(junior), junior.displayName)}
                  className={SESSION_CARD.card}
                >
                  <div className={SESSION_CARD.head}>
                    <Avatar name={junior.displayName} src={junior.avatarUrl} size="lg" />
                    <div className={SESSION_CARD.body}>
                      <span className={SESSION_CARD.title}>{junior.displayName}</span>
                      <span
                        className={junior.dispositif ? SESSION_CARD.meta : SESSION_CARD.metaPending}
                      >
                        {junior.dispositif?.name ?? ACADEMY_COPY.awaitingConfirmation}
                      </span>
                      {!isActive && (
                        <StatusText label={status.label} accent={status.accent} className="mt-1" />
                      )}
                    </div>
                  </div>

                  {progress !== null && (
                    <div className={SESSION_CARD.track} aria-hidden="true">
                      <div className={SESSION_CARD.fill} style={{ width: `${progress}%` }} />
                    </div>
                  )}

                  <div className={SESSION_CARD.foot}>
                    <span className={SESSION_CARD.date}>
                      {junior.trainer?.name ?? ACADEMY_COPY.noTrainer}
                    </span>
                    <span className={SESSION_CARD.date}>
                      {ACADEMY_STAGE_REGISTRY.label(junior.stage)}
                    </span>
                  </div>
                </article>
              )
            })}
            <AddRow
              tile
              label={ACADEMY_COPY.juniorAdd}
              disabled={!canManage || !hasCandidates}
              onClick={() => openJunior(null)}
            />
          </div>
        )}
      </Section>
    </div>
  )

  const threadTab = () => (
    <Section raised={threadSteps.length > 0} bare={threadSteps.length === 0}>
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
        <div className={HOME_STYLES.rows}>
          {threadSteps.map((step) => {
            const kind = ACADEMY_STEP_KIND_REGISTRY.get(step.kind)
            const KindIcon = ICONS[kind.icon]

            return (
              <div
                key={step.id}
                onContextMenu={contextMenu(stepMenu(step), step.title)}
                className={cn(HOME_STYLES.line, HOME_STYLES.item, 'items-start')}
              >
                <span className={HOME_STYLES.chip}>
                  <KindIcon className={HOME_STYLES.chipIcon} aria-hidden="true" />
                </span>
                <span className={RECORD_ROW.body}>
                  <span className={RECORD_ROW.title}>{step.title}</span>
                  <span className={RECORD_ROW.meta}>
                    {[formatDayTime(step.scheduledAt), step.juniorName, step.authorName]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {step.notes && (
                    <span className="pt-1 text-sm whitespace-pre-wrap">{step.notes}</span>
                  )}
                </span>
                <StatusText
                  label={step.doneAt ? ACADEMY_COPY.eventDone : ACADEMY_COPY.eventPlanned}
                  accent={step.doneAt ? 'success' : 'warning'}
                />
              </div>
            )
          })}
          <AddRow
            label={ACADEMY_COPY.eventAdd}
            disabled={!canManage}
            onClick={() => openStep(null)}
          />
        </div>
      )}
    </Section>
  )

  const renderTimelineStep = (
    step: AcademyStepView & { stage: AcademyStageName },
    index: number,
    all: (AcademyStepView & { stage: AcademyStageName })[]
  ) => {
    const state = step.state ?? 'idle'
    const isValidated = step.validatedAt !== null
    const Glyph = ICONS[state === 'done' ? 'success' : state === 'late' ? 'warning' : 'clock']

    return (
      <li key={step.id} className={STAGE_LIST.stage}>
        {index < all.length - 1 && <span className={STAGE_LIST.stageRail} aria-hidden="true" />}
        <span className={STEP_CHIPS[state]}>
          <Glyph className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className={STAGE_LIST.stageBody}>
          <span className="flex items-start gap-2">
            <span className={STAGE_LIST.stageTitle}>{step.title}</span>
            {canManage && (
              <Button
                variant="icon"
                icon={isValidated ? 'close' : 'confirm'}
                aria-label={isValidated ? ACADEMY_COPY.stepReopen : ACADEMY_COPY.stepValidate}
                className="-mt-1 ml-auto"
                disabled={!isValidated && blocked.has(step.id)}
                onClick={() => void session.setStepValidated(step.id, !isValidated)}
              />
            )}
          </span>
          <span className={STAGE_LIST.stageLead}>
            {[
              ACADEMY_STAGE_REGISTRY.label(step.stage),
              step.scheduledAt ? formatDay(step.scheduledAt) : null,
              step.owner ? STEP_OWNER_REGISTRY.label(step.owner) : null,
              step.validatedByName,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {step.notes && <span className="text-sm whitespace-pre-wrap">{step.notes}</span>}
        </div>
      </li>
    )
  }

  const timelineTab = () => (
    <Section bare>
      {timelineSteps.length === 0 ? (
        <EmptyState
          figure="academy"
          title={ACADEMY_COPY.timelineEmptyTitle}
          description={ACADEMY_COPY.timelineEmptyDescription}
          action={
            <Link href={ROUTES.academy}>
              <Button variant="primary" icon="academy">
                {ACADEMY_COPY.openSessions}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {sessionWideSteps.length > 0 && (
            <section className={TIMELINE_BOX}>
              <h3 className={SESSION_CARD.groupTitle}>{ACADEMY_COPY.timelineSessionWide}</h3>
              <ol>{sessionWideSteps.map(renderTimelineStep)}</ol>
            </section>
          )}
          {juniorGroups.map((group) => (
            <section key={group.junior.id} className={TIMELINE_BOX}>
              <header
                className={SESSION_CARD.groupHead}
                onClick={() => router.push(ROUTES.junior(detail.summary.id, group.junior.id))}
              >
                <Avatar name={group.junior.displayName} src={group.junior.avatarUrl} />
                <h3 className={SESSION_CARD.groupTitle}>{group.junior.displayName}</h3>
              </header>
              <ol>{group.steps.map(renderTimelineStep)}</ol>
            </section>
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

  const sessionStatus = ACADEMY_SESSION_STATUS_REGISTRY.get(detail.summary.status)

  return (
    <>
      <div className={SESSION_HERO.card}>
        <div>
          <div className={SESSION_HERO.body}>
            <div className={SESSION_HERO.facts}>
              <h2 className={SESSION_HERO.title}>{detail.summary.function.name}</h2>
              <div className={SESSION_HERO.meta}>
                {detail.summary.status !== AcademySessionStatuses.Running && (
                  <StatusText label={sessionStatus.label} accent={sessionStatus.accent} />
                )}
                <span>{formatDay(detail.summary.startsAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <FormDrawer
        subject={FORM_SUBJECTS.junior}
        open={dialog === 'junior'}
        title={editingJunior ? editingJunior.displayName : ACADEMY_COPY.juniorAdd}
        description={formatDay(detail.summary.startsAt)}
        fields={juniorFields}
        initialValues={editingJunior?.values}
        issues={session.issues}
        isSaving={session.isSaving}
        onSubmit={(values) =>
          editingJunior ? session.editJunior(editingJunior.id, values) : session.addJunior(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.academyStep}
        open={dialog === 'step'}
        title={editingStep ? editingStep.title : ACADEMY_COPY.eventAdd}
        fields={stepFields}
        initialValues={editingStep?.values}
        issues={session.issues}
        isSaving={session.isSaving}
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
