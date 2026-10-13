'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { PhaseTrack } from '@/components/elements/display/PhaseTrack'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { PageOptions, type PageOption } from '@/components/structures/PageOptions'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { ProgramCard } from '@/components/structures/ProgramCard'
import { Section } from '@/components/structures/Section'
import { useRecruitments } from '@/core/hooks/data/useRecruitments'
import { ROUTES } from '@/declarations/navigation'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { ACTION_COPY, PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { GROUP_STYLES, PROGRAM_CARD, PROGRAM_ROW } from '@/declarations/ui/variants'
import type { MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { RecruitmentSummary } from '@/types/recruitment'
import { FINISHED_RECRUITMENT_STATUSES, RecruitmentStatuses } from '@/utils/constants/recruitment'
import { formatDay, formatDayRange } from '@/utils/format/dates'

// Phases a campaign walks through
const PHASES: string[] = RECRUITMENT_STATUS_REGISTRY.keys.filter(
  (status) => status !== RecruitmentStatuses.Archived
)

// Responsable as a stack entry
const toPerson = (ref: RecruitmentSummary['responsables'][number]) => ({
  id: ref.id,
  name: ref.label,
  src: ref.image,
})

export interface RecruitmentsPanelProps {
  initialSessions: RecruitmentSummary[]
  fields: FieldDefinition[]
  canManage: boolean
}

/**
 * Recruitment sessions
 * @param {RecruitmentSummary[]} initialSessions - Sessions resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the session form
 * @param {boolean} canManage - Member may open and close sessions
 * @return {JSX.Element}
 */

export const RecruitmentsPanel = ({
  initialSessions,
  fields,
  canManage,
}: RecruitmentsPanelProps) => {
  const router = useRouter()
  const { sessions, isSaving, issues, clearIssues, create, update, remove } =
    useRecruitments(initialSessions)
  const [isCreating, setCreating] = useState(false)
  const [showFinished, setShowFinished] = useState(false)
  const [editing, setEditing] = useState<RecruitmentSummary | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<RecruitmentSummary | null>(null)

  // Running sessions first
  const [running, finished] = useMemo(
    () => [
      sessions.filter((entry) => !FINISHED_RECRUITMENT_STATUSES.includes(entry.status)),
      sessions.filter((entry) => FINISHED_RECRUITMENT_STATUSES.includes(entry.status)),
    ],
    [sessions]
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

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const sessionMenu = (entry: RecruitmentSummary): MenuItem[] => [
    {
      id: 'open',
      label: ACTION_COPY.open,
      icon: 'forward',
      onSelect: () => router.push(ROUTES.recruitment(entry.id)),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => {
        clearIssues()
        setEditing(entry)
      },
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingDeletion(entry),
    },
  ]

  const card = (entry: RecruitmentSummary, compact = false) => {
    const status = RECRUITMENT_STATUS_REGISTRY.get(entry.status)
    const period =
      entry.opensAt && entry.closesAt
        ? formatDayRange(entry.opensAt, entry.closesAt)
        : entry.opensAt
          ? formatDay(entry.opensAt)
          : undefined

    return (
      <ProgramCard
        key={entry.id}
        compact={compact}
        title={entry.jobFunction.label}
        meta={compact ? status.label : period}
        icon={entry.jobFunction.icon}
        accent={entry.jobFunction.accent}
        foot={
          <PhaseTrack
            phases={PHASES}
            current={entry.status}
            label={status.label}
            accent={status.accent}
          />
        }
        side={<AvatarStack people={entry.responsables.map(toPerson)} size="sm" />}
        menu={sessionMenu(entry)}
        onOpen={() => router.push(ROUTES.recruitment(entry.id))}
      />
    )
  }

  const drawers = () => (
    <>
      <FormDrawer
        subject={FORM_SUBJECTS.recruitment}
        open={isCreating}
        title={RECRUITMENT_COPY.addTitle}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.recruitment}
        open={editing !== null}
        title={RECRUITMENT_COPY.editTitle}
        fields={fields}
        initialValues={editing?.values}
        issues={issues}
        isSaving={isSaving}
        onSubmit={(values) => update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={RECRUITMENT_COPY.deleteTitle}
        description={RECRUITMENT_COPY.deleteDescription}
        pending={isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </>
  )

  if (sessions.length === 0) {
    return (
      <>
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.emptyTitle}
          description={RECRUITMENT_COPY.emptyDescription}
          action={
            <Button variant="primary" icon="add" disabled={!canManage} onClick={openCreate}>
              {RECRUITMENT_COPY.add}
            </Button>
          }
        />
        {drawers()}
      </>
    )
  }

  return (
    <>
      <PageOptions options={pageOptions} />
      <div className={GROUP_STYLES.spaced}>
        <Section title={RECRUITMENT_COPY.groupOpen} bare>
          <div className={PROGRAM_CARD.grid}>
            {running.map((entry) => card(entry))}
            <AddRow
              tile="session"
              label={RECRUITMENT_COPY.add}
              disabled={!canManage}
              onClick={openCreate}
            />
          </div>
        </Section>

        {showFinished && finished.length > 0 && (
          <Section title={RECRUITMENT_COPY.groupFinished} bare>
            <div className={PROGRAM_ROW.list}>{finished.map((entry) => card(entry, true))}</div>
          </Section>
        )}
      </div>

      {drawers()}
    </>
  )
}
