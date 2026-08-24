'use client'

import { useRouter } from 'next/navigation'
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
import { useSession } from '@/core/hooks/data/useAcademy'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_STEP_KIND_REGISTRY,
  ACADEMY_JUNIOR_STATUS_REGISTRY,
} from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { toTone } from '@/declarations/ui/theme'
import { LIST_STYLES, TIMELINE_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { AcademyStepView, JuniorView, SessionDetail } from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { formatDay, formatDayTime } from '@/utils/format/dates'

export interface SessionPanelProps {
  detail: SessionDetail
  juniorFields: FieldDefinition[]
  stepFields: FieldDefinition[]
  hasCandidates: boolean
  canManage: boolean
}

/**
 * One session, its juniors on one tab and everything planned or held on the other
 * @param {SessionDetail} detail - Session resolved server-side
 * @param {FieldDefinition[]} juniorFields - Declarations of the junior form
 * @param {FieldDefinition[]} stepFields - Declarations of the thread form
 * @param {boolean} hasCandidates - At least one moderator may still be taken in
 * @param {boolean} canManage - Member may drive the session
 * @return {JSX.Element}
 */

export const SessionPanel = ({
  detail,
  juniorFields,
  stepFields,
  hasCandidates,
  canManage,
}: SessionPanelProps) => {
  const router = useRouter()
  const session = useSession(detail.summary.id, detail.juniors, detail.steps)
  const { contextMenu } = useMenu()
  const [dialog, setDialog] = useState<'junior' | 'step' | null>(null)
  const [editingJunior, setEditingJunior] = useState<JuniorView | null>(null)
  const [editingStep, setEditingStep] = useState<AcademyStepView | null>(null)
  const [pendingJunior, setPendingJunior] = useState<JuniorView | null>(null)
  const [pendingStep, setPendingStep] = useState<AcademyStepView | null>(null)

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
                      tone={toTone(junior.dispositif.accent, 'info')}
                    />
                    <Badge label={status.label} tone={toTone(status.accent, 'neutral')} dot />
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
      {session.steps.length === 0 ? (
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
            {session.steps.map((step) => {
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
            value: 'thread',
            label: ACADEMY_COPY.tabThread,
            icon: 'history',
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
