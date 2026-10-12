'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { RecordId } from '@/components/elements/display/RecordId'
import { Status } from '@/components/elements/display/Status'
import { ICONS } from '@/declarations/ui/icons'
import { OptionMark } from '@/components/elements/forms/OptionMark'
import { CreatorLabels } from '@/components/elements/display/RecordLabel'
import { pickedOptions } from '@/core/lib/forms/options'
import { OverdueMark } from '@/composites/work/OverdueMark'
import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EditableDetailGrid, type EditableEntry } from '@/components/structures/EditableDetailGrid'
import { Glyph } from '@/components/elements/display/Glyph'
import { EditableHeading } from '@/components/structures/EditableHeading'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { InlineMarkdown } from '@/components/structures/InlineMarkdown'
import { Section } from '@/components/structures/Section'
import { FileTabs } from '@/components/structures/FileTabs'
import { ProjectTeam } from '@/composites/work/ProjectTeam'
import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useCommunications } from '@/core/hooks/data/useCommunications'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { mentionChoices } from '@/components/elements/forms/DiscordComposer'
import { WORK_DISCORD_COPY } from '@/declarations/work/copy'
import { COMMUNICATION_HEAD, DISCORD_MESSAGE } from '@/declarations/ui/variants'
import { useMutation } from '@/core/hooks/data/useMutation'
import { useRecordFile } from '@/core/hooks/data/useRecordFile'
import { ROUTES } from '@/declarations/navigation'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { ACTION_COPY, FIELD_COPY, feedbackTitle } from '@/declarations/ui/copy'
import { LIST_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

import {
  BOARD_ENTITY_COPY,
  MEETING_COPY,
  PROJECT_COPY,
  PROJECT_FIELD_COPY,
  TASK_COPY,
} from '@/declarations/work/copy'
import { useEditGestures } from '@/core/hooks/interaction/useEditGestures'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { CommunicationEntry, MeetingSummary, ProjectDetail, TaskSummary } from '@/types/work'
import { WorkflowPhases, WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay, formatDayTime } from '@/utils/format/dates'

const DotGlyph = ICONS.statusDot

export interface ProjectFileTabsProps {
  detail: ProjectDetail
  projectFields: FieldDefinition[]
  taskFields: FieldDefinition[]
  meetingFields: FieldDefinition[]
  communicationFields: FieldDefinition[]
  activity: ActivityEntry[]
  canUpdate: boolean
  canReadLogs: boolean
  doneStateId: string | null
  canValidateTasks: boolean
  canCreateTasks: boolean
  canReadTasks: boolean
  canCreateMeetings: boolean
  canReadMeetings: boolean
  canReadCommunications: boolean
  canWriteCommunications: boolean
}

/**
 * Tabs of one project file — a pastel overview edited in place
 * @param {ProjectDetail} detail - File resolved server-side
 * @param {FieldDefinition[]} projectFields - Declarations of the project form
 * @param {FieldDefinition[]} taskFields - Declarations of the task form
 * @param {FieldDefinition[]} meetingFields - Declarations of the meeting form
 * @param {FieldDefinition[]} communicationFields - Declarations of the announcement form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {boolean} canUpdate - Member may edit the project
 * @param {boolean} canReadLogs - Member may read the journal
 * @param {string | null} doneStateId - Task state meaning validated
 * @param {boolean} canValidateTasks - Member may validate a task
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
  canReadLogs,
  doneStateId,
  canValidateTasks,
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
  const copyAnnouncement = useCopy(WORK_DISCORD_COPY.copied)
  const { session } = useAuthContext()
  const workItem = useMutation()
  const { contextMenu } = useMenu()
  const gestures = useEditGestures()
  const [isWriting, setWriting] = useState(false)
  const [editing, setEditing] = useState<CommunicationEntry | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<CommunicationEntry | null>(null)
  const [dialog, setDialog] = useState<'task' | 'meeting' | null>(null)

  const fieldByName = new Map(projectFields.map((field) => [field.name, field]))
  const fieldFor = (name: string): FieldDefinition => fieldByName.get(name)!

  // Option backing one select value
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

  // Both dialogs prefill the project
  const workItemDefaults: FormValues = {
    projectId: summary.id,
    youtuberIds: summary.youtubers.map((youtuber) => youtuber.id),
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
  const descriptionValue =
    typeof file.values.description === 'string' ? file.values.description : ''
  const deadlineValue = typeof file.values.deadline === 'string' ? file.values.deadline : null
  const stateOption = optionOf('stateId')
  const priorityOption = optionOf('priorityId')
  const platformOption = optionOf('platformId')
  const youtuberOptions = pickedOptions(fieldFor('youtuberIds'), file.values.youtuberIds)

  const infoEntries: EditableEntry[] = [
    { label: FIELD_COPY.id, display: <RecordId id={summary.id} /> },
    {
      label: PROJECT_FIELD_COPY.state,
      field: fieldFor('stateId'),
      display: stateOption ? (
        <Status label={stateOption.label} accent={stateOption.accent} icon="statusDot" />
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.priority,
      field: fieldFor('priorityId'),
      display: priorityOption ? (
        <span className="inline-flex items-center gap-2">
          <OptionMark mark="priority" option={priorityOption} />
          <Status label={priorityOption.label} accent={priorityOption.accent} tone="warning" />
        </span>
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.platform,
      field: fieldFor('platformId'),
      display: platformOption ? (
        <span className="inline-flex items-center gap-2">
          <OptionMark mark="network" option={platformOption} />
          <Status label={platformOption.label} tone="neutral" />
        </span>
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.youtubers,
      field: fieldFor('youtuberIds'),
      display:
        youtuberOptions.length > 0 ? (
          <CreatorLabels
            creators={youtuberOptions.map((option) => ({
              name: option.label,
              image: option.image,
            }))}
          />
        ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.deadline,
      field: fieldFor('deadline'),
      display: deadlineValue ? (
        <span className="inline-flex items-center gap-3">
          <Status
            label={formatDay(deadlineValue)}
            tone={summary.isOverdue ? 'danger' : 'neutral'}
            icon="deadline"
          />
          {summary.isOverdue && <OverdueMark kind="project" />}
        </span>
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

  // Neutral box
  const boxClass =
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 sm:p-5'

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
          <h3 className={SECTION_STYLES.wellTitle}>{PROJECT_FIELD_COPY.description}</h3>
          <div className={SECTION_STYLES.well}>
            <InlineMarkdown
              id="project-description"
              value={descriptionValue}
              placeholder={PROJECT_COPY.descriptionEmpty}
              disabled={!canUpdate}
              maxLength={fieldFor('description').maxLength}
              onCommit={(next) => file.saveField('description', next.trim() === '' ? null : next)}
            />
          </div>
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

  // Mentions an announcement may carry
  const mentions = mentionChoices(
    communicationFields.find((field) => field.kind === 'announcement')?.options ?? []
  )

  // Announcement as Discord draws it, live
  const communicationPreview = {
    label: PROJECT_COPY.communicationPreview,
    render: (values: FormValues) => (
      <div className={cn(DISCORD_MESSAGE.frame, DISCORD_MESSAGE.pane, 'overflow-y-auto')}>
        <DiscordMessage
          source={typeof values.body === 'string' ? values.body : ''}
          mentions={mentions}
          author={session?.displayName ?? ''}
        />
      </div>
    ),
  }

  const communicationTab = () => (
    <Section
      title={PROJECT_COPY.communicationTitle}
      description={PROJECT_COPY.communicationLead}
      maturity="beta"
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
              className={cn(LIST_STYLES.card, canWriteCommunications && LIST_STYLES.cardClickable)}
              {...gestures({
                canEdit: canWriteCommunications,
                onEdit: () => {
                  communications.clearIssues()
                  setEditing(entry)
                },
              })}
              onContextMenu={contextMenu(entryMenu(entry), entry.title)}
            >
              <header className={COMMUNICATION_HEAD.wrapper}>
                <h3 className={COMMUNICATION_HEAD.title}>{entry.title}</h3>
                <dl className={COMMUNICATION_HEAD.list}>
                  <div className={COMMUNICATION_HEAD.row}>
                    <dt className={COMMUNICATION_HEAD.term}>
                      <DotGlyph className="size-3.5 shrink-0" />
                      {PROJECT_COPY.inCharge}
                    </dt>
                    <dd>{entry.authorName ?? WORK_DISCORD_COPY.author}</dd>
                  </div>
                  <div className={COMMUNICATION_HEAD.row}>
                    <dt className={COMMUNICATION_HEAD.term}>
                      <DotGlyph className="size-3.5 shrink-0" />
                      {PROJECT_COPY.status}
                    </dt>
                    <dd>
                      <Status
                        label={entry.publishedAt ? PROJECT_COPY.published : PROJECT_COPY.draft}
                        tone={entry.publishedAt ? 'success' : 'neutral'}
                        icon="statusDot"
                      />
                    </dd>
                  </div>
                </dl>
              </header>
              <h4 className={COMMUNICATION_HEAD.section}>{PROJECT_FIELD_COPY.communicationBody}</h4>
              <div className={DISCORD_MESSAGE.frame}>
                <Button
                  variant="icon"
                  icon="copy"
                  aria-label={WORK_DISCORD_COPY.copy}
                  title={WORK_DISCORD_COPY.copy}
                  className={DISCORD_MESSAGE.copyCorner}
                  onClick={() => void copyAnnouncement(entry.body)}
                />
                <DiscordMessage
                  source={entry.body}
                  mentions={mentions}
                  author={entry.authorName ?? WORK_DISCORD_COPY.author}
                  time={entry.publishedAt ? formatDay(entry.publishedAt) : undefined}
                />
              </div>
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

  const validateTask = async (task: TaskSummary) => {
    const moved = await workItem.run(
      () =>
        apiPatch(API_ROUTES.board, {
          scope: WorkflowScopes.Task,
          id: task.id,
          columnId: doneStateId,
          index: 0,
        }),
      TASK_COPY.validated
    )

    if (moved !== null) router.refresh()
  }

  // Check ahead of a task row
  const taskCheck = (task: TaskSummary) => {
    const done = isValidated(task)

    return (
      <Button
        variant="icon"
        icon="check"
        aria-label={TASK_COPY.validate}
        title={done ? TASK_COPY.validated : TASK_COPY.validate}
        aria-pressed={done}
        disabled={done || !doneStateId || !canValidateTasks || workItem.isSaving}
        className={cn(!done && 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')}
        onClick={() => void validateTask(task)}
      />
    )
  }

  const isValidated = (task: TaskSummary) => task.state?.phase === WorkflowPhases.Done

  // Validated tasks sink, order kept otherwise
  const orderedTasks = [...detail.tasks].sort(
    (a, b) => Number(isValidated(a)) - Number(isValidated(b))
  )

  // Shared task row body: on a phone the owner stands over the title
  const taskLine = (task: TaskSummary) => (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-3">
        {task.owner && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-ink-subtle)] md:order-2">
            <span className="md:hidden">
              <Avatar name={task.owner.name} src={task.owner.src} size="xs" />
            </span>
            {task.owner.name}
          </span>
        )}
        <span className="flex min-w-0 flex-1 items-center gap-2 md:order-1 md:gap-3">
          <Glyph value={task.emoji} size="row" />
          <span
            className={cn(
              'min-w-0 flex-1 truncate font-medium',
              isValidated(task) && 'text-[var(--color-ink-subtle)] line-through'
            )}
          >
            {task.title}
          </span>
        </span>
      </span>
      {task.state && <Status label={task.state.label} accent={task.state.accent} />}
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
          {orderedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                LIST_STYLES.item,
                canReadTasks && LIST_STYLES.itemClickable,
                isValidated(task) && 'opacity-60'
              )}
            >
              {taskCheck(task)}
              {canReadTasks ? (
                <button
                  type="button"
                  onClick={() => router.push(ROUTES.task(task.id))}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  {taskLine(task)}
                </button>
              ) : (
                <div className="flex min-w-0 flex-1 items-center gap-3">{taskLine(task)}</div>
              )}
            </div>
          ))}
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
    <Section title={PROJECT_COPY.tabLogs} maturity="beta" bare>
      <div className="flex flex-col gap-4">
        {activity.length === 0 ? (
          <EmptyState
            figure="notes"
            title={PROJECT_COPY.logsEmptyTitle}
            description={PROJECT_COPY.logsEmptyDescription}
            action={<Status label={PROJECT_COPY.tabLogs} tone="neutral" />}
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
          {
            value: 'logs',
            label: PROJECT_COPY.tabLogs,
            icon: 'history',
            visible: canReadLogs,
            render: logsTab,
          },
        ]}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.task}
        open={dialog === 'task'}
        title={PROJECT_COPY.taskCreate}
        fields={taskFields}
        initialValues={workItemDefaults}
        issues={workItem.issues}
        isSaving={workItem.isSaving}
        onSubmit={(values) => createWorkItem(API_ROUTES.tasks, BOARD_ENTITY_COPY.TASK, values)}
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.meeting}
        open={dialog === 'meeting'}
        title={PROJECT_COPY.meetingCreate}
        fields={meetingFields}
        initialValues={workItemDefaults}
        issues={workItem.issues}
        isSaving={workItem.isSaving}
        onSubmit={(values) =>
          createWorkItem(API_ROUTES.meetings, BOARD_ENTITY_COPY.MEETING, values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.communication}
        open={isWriting}
        title={PROJECT_COPY.communicationAdd}
        fields={communicationFields}
        aside={communicationPreview}
        issues={communications.issues}
        isSaving={communications.isSaving}
        onSubmit={communications.create}
        onClose={() => setWriting(false)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.project}
        open={editing !== null}
        title={editing ? `${ACTION_COPY.edit} · ${editing.title}` : ACTION_COPY.edit}
        fields={communicationFields}
        aside={communicationPreview}
        initialValues={editing?.values}
        issues={communications.issues}
        isSaving={communications.isSaving}
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
