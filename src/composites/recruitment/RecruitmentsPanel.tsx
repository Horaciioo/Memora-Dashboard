'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { StatusText } from '@/components/elements/display/StatusText'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/Section'
import { useRecruitments } from '@/core/hooks/data/useRecruitments'
import { ROUTES } from '@/declarations/navigation'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { GROUP_STYLES, RECORD_ROW } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { RecruitmentSummary } from '@/types/recruitment'
import { FINISHED_RECRUITMENT_STATUSES } from '@/utils/constants/recruitment'
import { formatDay } from '@/utils/format/dates'

export interface RecruitmentsPanelProps {
  initialSessions: RecruitmentSummary[]
  fields: FieldDefinition[]
  canManage: boolean
}

/**
 * Recruitment sessions, the running ones first then the finished, each opening its own file
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
  const { contextMenu } = useMenu()
  const [isCreating, setCreating] = useState(false)
  const [editing, setEditing] = useState<RecruitmentSummary | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<RecruitmentSummary | null>(null)

  // Running sessions first, the finished ones below
  const [running, finished] = useMemo(
    () => [
      sessions.filter((entry) => !FINISHED_RECRUITMENT_STATUSES.includes(entry.status)),
      sessions.filter((entry) => FINISHED_RECRUITMENT_STATUSES.includes(entry.status)),
    ],
    [sessions]
  )

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

  const row = (entry: RecruitmentSummary) => {
    const status = RECRUITMENT_STATUS_REGISTRY.get(entry.status)

    return (
      <article
        key={entry.id}
        onClick={() => router.push(ROUTES.recruitment(entry.id))}
        onContextMenu={contextMenu(sessionMenu(entry), entry.name)}
        className={RECORD_ROW.root}
      >
        <Avatar name={entry.youtuber.label} src={entry.youtuber.image} size="md" />
        <span className={RECORD_ROW.body}>
          <span className={RECORD_ROW.title}>{entry.name}</span>
          <span className={RECORD_ROW.meta}>
            {[entry.jobFunction.label, entry.opensAt ? formatDay(entry.opensAt) : null]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </span>
        <StatusText label={status.label} accent={status.accent} />
      </article>
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
      <div className={GROUP_STYLES.spaced}>
        <Section title={RECRUITMENT_COPY.groupOpen} bare>
          <div className={RECORD_ROW.stack}>
            {running.map(row)}
            <AddRow label={RECRUITMENT_COPY.add} disabled={!canManage} onClick={openCreate} />
          </div>
        </Section>

        {finished.length > 0 && (
          <Section title={RECRUITMENT_COPY.groupFinished} bare>
            <div className={RECORD_ROW.stack}>{finished.map(row)}</div>
          </Section>
        )}
      </div>

      {drawers()}
    </>
  )
}
