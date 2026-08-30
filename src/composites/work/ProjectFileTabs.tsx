'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EditableDetailGrid, type EditableEntry } from '@/components/structures/EditableDetailGrid'
import { Glyph } from '@/components/elements/display/Glyph'
import { EditableHeading } from '@/components/structures/EditableHeading'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { FileTabs } from '@/components/structures/FileTabs'
import { ProjectTeam } from '@/composites/work/ProjectTeam'
import { AuthorshipStrip } from '@/composites/work/authorship'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useCommunications } from '@/core/hooks/data/useCommunications'
import { useMutation } from '@/core/hooks/data/useMutation'
import { useRecordFile } from '@/core/hooks/data/useRecordFile'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY, feedbackTitle } from '@/declarations/ui/copy'
import { LIST_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

import {
  BOARD_ENTITY_COPY,
  MEETING_COPY,
  PROJECT_COPY,
  PROJECT_FIELD_COPY,
  TASK_COPY,
} from '@/declarations/work/copy'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { CommunicationEntry, MeetingSummary, ProjectDetail, TaskSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay, formatDayTime, isOverdue } from '@/utils/format/dates'

export interface ProjectFileTabsProps {
  detail: ProjectDetail
  projectFields: FieldDefinition[]
  taskFields: FieldDefinition[]
  meetingFields: FieldDefinition[]
  communicationFields: FieldDefinition[]
  activity: ActivityEntry[]
  canUpdate: boolean
  canCreateTasks: boolean
  canReadTasks: boolean
  canCreateMeetings: boolean
  canReadMeetings: boolean
  canReadCommunications: boolean
  canWriteCommunications: boolean
}

/**
 * Tabs of one project file — a pastel overview edited in place, quick task and meeting
 * creation scoped to the project, the announcement editor and the journal
 * @param {ProjectDetail} detail - File resolved server-side
 * @param {FieldDefinition[]} projectFields - Declarations of the project form
 * @param {FieldDefinition[]} taskFields - Declarations of the task form
 * @param {FieldDefinition[]} meetingFields - Declarations of the meeting form
 * @param {FieldDefinition[]} communicationFields - Declarations of the announcement form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {boolean} canUpdate - Member may edit the project
 * @param {boolean} canCreateTasks - Member may open a task
 * @param {boolean} canReadTasks - Member may open a task file
 * @param {boolean} canCreateMeetings - Member may plan a meeting
 * @param {boolean} canReadMeetings - Member may open a meeting file
 * @param {boolean} canReadCommunications - Member may read announcements
 * @param {boolean} canWriteCommunications - Member may write announcements
 * @return {JSX.Element}
 */

export const ProjectFileTabs = ({
  detail,
  projectFields,
  taskFields,
  meetingFields,
  communicationFields,
  activity,
  canUpdate,
  canCreateTasks,
  canReadTasks,
  canCreateMeetings,
  canReadMeetings,
  canReadCommunications,
  canWriteCommunications,
}: ProjectFileTabsProps) => {
  const router = useRouter()
  const { summary } = detail
  const file = useRecordFile({
    path: API_ROUTES.project(summary.id),
    scope: WorkflowScopes.Project,
    initialValues: summary.values,
  })
  const communications = useCommunications(summary.id, detail.communications)
  const workItem = useMutation()
  const { contextMenu } = useMenu()
  const [isWriting, setWriting] = useState(false)
  const [editing, setEditing] = useState<CommunicationEntry | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<CommunicationEntry | null>(null)
  const [dialog, setDialog] = useState<'task' | 'meeting' | null>(null)

  const fieldByName = new Map(projectFields.map((field) => [field.name, field]))
  const fieldFor = (name: string): FieldDefinition => fieldByName.get(name)!

  // Option backing one select value, feeding the read rendering of the grid
  const optionOf = (name: string) => {
    const value = file.values[name]

    return typeof value === 'string' && value
      ? (fieldFor(name).options?.find((option) => option.value === value) ?? null)
      : null
  }

  const openWorkItem = (kind: 'task' | 'meeting') => {
    workItem.clearIssues()
    setDialog(kind)
  }

  // Both dialogs prefill the project, and its YouTuber when it carries one
  const workItemDefaults: FormValues = {
    projectId: summary.id,
    youtuberId: summary.youtuber?.id ?? null,
  }

  const createWorkItem = async (
    path: string,
    entity: (typeof BOARD_ENTITY_COPY)[keyof typeof BOARD_ENTITY_COPY],
    values: FormValues
  ) => {
    const name = typeof values.title === 'string' ? values.title : undefined
    const created = await workItem.run(
      () => apiPost(path, values),
      feedbackTitle(entity.label, 'created', entity.gender, name)
    )

    if (created !== null) router.refresh()

    return created !== null
  }

  const titleValue = typeof file.values.title === 'string' ? file.values.title : summary.title
  const emojiValue = typeof file.values.emoji === 'string' ? file.values.emoji : summary.emoji
  const deadlineValue = typeof file.values.deadline === 'string' ? file.values.deadline : null
  const stateOption = optionOf('stateId')
  const priorityOption = optionOf('priorityId')
  const platformOption = optionOf('platformId')
  const youtuberOption = optionOf('youtuberId')

  const infoEntries: EditableEntry[] = [
    {
      label: PROJECT_FIELD_COPY.state,
      field: fieldFor('stateId'),
      display: stateOption ? (
        <Badge label={stateOption.label} accent={stateOption.accent} dot />
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.priority,
      field: fieldFor('priorityId'),
      display: priorityOption ? (
        <Badge label={priorityOption.label} accent={priorityOption.accent} tone="warning" />
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.platform,
      field: fieldFor('platformId'),
      display: platformOption ? <Badge label={platformOption.label} tone="neutral" /> : null,
    },
    {
      label: PROJECT_FIELD_COPY.youtuber,
      field: fieldFor('youtuberId'),
      display: youtuberOption ? (
        <Badge
          label={youtuberOption.label}
          accent={youtuberOption.accent}
          tone="info"
          icon="youtuber"
        />
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.deadline,
      field: fieldFor('deadline'),
      display: deadlineValue ? (
        <Badge
          label={formatDay(deadlineValue)}
          tone={isOverdue(deadlineValue) ? 'danger' : 'neutral'}
          icon="deadline"
        />
      ) : null,
    },
  ]

  const entryMenu = (entry: CommunicationEntry): MenuItem[] => [
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canWriteCommunications,
      onSelect: () => {
        communications.clearIssues()
        setEditing(entry)
      },
    },
    {
      id: 'copy',
      label: ACTION_COPY.copyLink,
      icon: 'copy',
      onSelect: () => void navigator.clipboard.writeText(entry.body),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canWriteCommunications,
      onSelect: () => setPendingDeletion(entry),
    },
  ]

  const openWrite = () => {
    communications.clearIssues()
    setWriting(true)
  }

  // Neutral box, state colour on its badge
  const boxClass =
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5'

  const overviewTab = () => (
    <div className="flex flex-col gap-8">
      <section className={SECTION_STYLES.wrapper}>
        <h2 className={SECTION_STYLES.title}>{PROJECT_COPY.informations}</h2>
        <div className={boxClass}>
          <EditableDetailGrid
            entries={infoEntries}
            values={file.values}
            issues={file.issues}
            disabled={!canUpdate}
            onCommit={file.saveField}
          />
        </div>
      </section>
      <section className={SECTION_STYLES.wrapper}>
        <h2 className={SECTION_STYLES.title}>{PROJECT_COPY.teamTitle}</h2>
        <div className={boxClass}>
          <ProjectTeam
            leads={summary.leads}
            assistants={summary.assistants}
            leadOptions={fieldFor('leadIds').options ?? []}
            assistantOptions={fieldFor('assistantIds').options ?? []}
            disabled={!canUpdate}
            isSaving={file.isSaving}
            onSave={file.saveFields}
          />
        </div>
      </section>
    </div>
  )

  const communicationTab = () => (
    <Section
      title={PROJECT_COPY.communicationTitle}
      description={PROJECT_COPY.communicationLead}
      action={<MaturityTag maturity="beta" />}
      bare
    >
      {communications.entries.length === 0 ? (
        <EmptyState
          figure="notes"
          title={PROJECT_COPY.communicationEmptyTitle}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canWriteCommunications}
              onClick={openWrite}
            >
              {PROJECT_COPY.communicationAdd}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {communications.entries.map((entry) => (
            <article
              key={entry.id}
              onContextMenu={contextMenu(entryMenu(entry), entry.title)}
              className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
            >
              <header className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold">{entry.title}</h3>
                {entry.platform && <Badge label={entry.platform.label} tone="info" />}
                <Badge
                  label={entry.publishedAt ? PROJECT_COPY.published : PROJECT_COPY.draft}
                  tone={entry.publishedAt ? 'success' : 'neutral'}
                  dot
                />
                <span className="ml-auto text-xs text-[var(--color-ink-subtle)]">
                  {[entry.authorName, entry.publishedAt ? formatDay(entry.publishedAt) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <Button
                  variant="icon"
                  icon="edit"
                  aria-label={ACTION_COPY.edit}
                  disabled={!canWriteCommunications}
                  onClick={() => {
                    communications.clearIssues()
                    setEditing(entry)
                  }}
                />
              </header>
              <Markdown source={entry.body} />
            </article>
          ))}
          <AddRow
            label={PROJECT_COPY.communicationAdd}
            disabled={!canWriteCommunications}
            onClick={openWrite}
          />
        </div>
      )}
    </Section>
  )

  // Shared task row body
  const taskLine = (task: TaskSummary) => (
    <>
      <Glyph value={task.emoji} size="row" />
      <span className="min-w-0 flex-1 truncate font-medium">{task.title}</span>
      {task.owner && (
        <span className="text-xs text-[var(--color-ink-subtle)]">{task.owner.name}</span>
      )}
      {task.state && <Badge label={task.state.label} accent={task.state.accent} dot />}
    </>
  )

  // Shared meeting row body
  const meetingLine = (meeting: MeetingSummary) => (
    <>
      <Glyph value={meeting.emoji} size="row" />
      <span className="min-w-0 flex-1 truncate font-medium">{meeting.title}</span>
      <span className="text-xs text-[var(--color-ink-subtle)]">
        {formatDayTime(meeting.scheduledAt)}
      </span>
      <AvatarStack people={meeting.participants} />
    </>
  )

  const tasksTab = () => (
    <Section title={PROJECT_COPY.tabTasks} bare>
      {detail.tasks.length === 0 ? (
        <EmptyState
          figure="tasks"
          title={TASK_COPY.emptyTitle}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canCreateTasks}
              onClick={() => openWorkItem('task')}
            >
              {PROJECT_COPY.taskCreate}
            </Button>
          }
        />
      ) : (
        <div className={LIST_STYLES.stack}>
          {detail.tasks.map((task) =>
            canReadTasks ? (
              <button
                key={task.id}
                type="button"
                onClick={() => router.push(ROUTES.task(task.id))}
                className={cn(LIST_STYLES.item, LIST_STYLES.itemClickable, 'text-left')}
              >
                {taskLine(task)}
              </button>
            ) : (
              <div key={task.id} className={LIST_STYLES.item}>
                {taskLine(task)}
              </div>
            )
          )}
          <AddRow
            label={PROJECT_COPY.taskCreate}
            disabled={!canCreateTasks}
            onClick={() => openWorkItem('task')}
          />
        </div>
      )}
    </Section>
  )

  const meetingsTab = () => (
    <Section title={PROJECT_COPY.tabMeetings} bare>
      {detail.meetings.length === 0 ? (
        <EmptyState
          figure="meetings"
          title={MEETING_COPY.emptyTitle}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canCreateMeetings}
              onClick={() => openWorkItem('meeting')}
            >
              {PROJECT_COPY.meetingCreate}
            </Button>
          }
        />
      ) : (
        <div className={LIST_STYLES.stack}>
          {detail.meetings.map((meeting) =>
            canReadMeetings ? (
              <button
                key={meeting.id}
                type="button"
                onClick={() => router.push(ROUTES.meeting(meeting.id))}
                className={cn(LIST_STYLES.item, LIST_STYLES.itemClickable, 'text-left')}
              >
                {meetingLine(meeting)}
              </button>
            ) : (
              <div key={meeting.id} className={LIST_STYLES.item}>
                {meetingLine(meeting)}
              </div>
            )
          )}
          <AddRow
            label={PROJECT_COPY.meetingCreate}
            disabled={!canCreateMeetings}
            onClick={() => openWorkItem('meeting')}
          />
        </div>
      )}
    </Section>
  )

  const logsTab = () => (
    <Section title={PROJECT_COPY.tabLogs} bare>
      <div className="flex flex-col gap-4">
        <AuthorshipStrip record={summary} />
        {activity.length === 0 ? (
          <EmptyState
            figure="notes"
            title={PROJECT_COPY.logsEmptyTitle}
            description={PROJECT_COPY.logsEmptyDescription}
            action={<Badge label={PROJECT_COPY.tabLogs} tone="neutral" />}
          />
        ) : (
          <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded)}>
            <ActivityTimeline entries={activity} />
          </div>
        )}
      </div>
    </Section>
  )

  return (
    <div className="flex flex-col gap-8">
      <EditableHeading
        value={titleValue}
        glyph={emojiValue}
        disabled={!canUpdate}
        onCommit={(next) => file.saveField('title', next)}
        onGlyphCommit={(next) => file.saveField('emoji', next)}
      />

      <FileTabs
        label={PROJECT_COPY.title}
        tabs={[
          {
            value: 'overview',
            label: PROJECT_COPY.tabOverview,
            icon: 'sheet',
            render: overviewTab,
          },
          {
            value: 'communication',
            label: PROJECT_COPY.tabCommunication,
            icon: 'discord',
            visible: canReadCommunications,
            render: communicationTab,
          },
          { value: 'tasks', label: PROJECT_COPY.tabTasks, icon: 'tasks', render: tasksTab },
          {
            value: 'meetings',
            label: PROJECT_COPY.tabMeetings,
            icon: 'meetings',
            render: meetingsTab,
          },
          { value: 'logs', label: PROJECT_COPY.tabLogs, icon: 'history', render: logsTab },
        ]}
      />

      <FormDialog
        open={dialog === 'task'}
        title={PROJECT_COPY.taskCreate}
        fields={taskFields}
        initialValues={workItemDefaults}
        issues={workItem.issues}
        isSaving={workItem.isSaving}
        size="lg"
        onSubmit={(values) => createWorkItem(API_ROUTES.tasks, BOARD_ENTITY_COPY.TASK, values)}
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'meeting'}
        title={PROJECT_COPY.meetingCreate}
        fields={meetingFields}
        initialValues={workItemDefaults}
        issues={workItem.issues}
        isSaving={workItem.isSaving}
        size="lg"
        onSubmit={(values) =>
          createWorkItem(API_ROUTES.meetings, BOARD_ENTITY_COPY.MEETING, values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={isWriting}
        title={PROJECT_COPY.communicationAdd}
        fields={communicationFields}
        issues={communications.issues}
        isSaving={communications.isSaving}
        size="lg"
        onSubmit={communications.create}
        onClose={() => setWriting(false)}
      />

      <FormDialog
        open={editing !== null}
        title={editing ? `${ACTION_COPY.edit} · ${editing.title}` : ACTION_COPY.edit}
        fields={communicationFields}
        initialValues={editing?.values}
        issues={communications.issues}
        isSaving={communications.isSaving}
        size="lg"
        onSubmit={(values) => communications.update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={PROJECT_COPY.communicationDeleteTitle}
        description={PROJECT_COPY.communicationDeleteDescription}
        pending={communications.isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await communications.remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </div>
  )
}
