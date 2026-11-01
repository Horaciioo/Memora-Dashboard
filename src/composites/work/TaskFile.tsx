'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { RecordId } from '@/components/elements/display/RecordId'
import { OptionMark } from '@/components/elements/forms/selects/OptionMark'
import { Status } from '@/components/elements/display/Status'
import { CreatorLabels, ProjectLabel } from '@/components/elements/display/RecordLabel'
import { pickedOptions } from '@/core/lib/forms/options'
import { FloatingFocus } from '@/composites/search/assistant/FloatingFocus'
import { WorkComments } from '@/composites/work/WorkComments'
import { OverdueMark } from '@/composites/work/OverdueMark'
import { TaskCheck } from '@/composites/work/TaskCheck'
import Link from '@/components/elements/navigation/AppLink'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ActivityTimeline } from '@/components/structures/data/ActivityTimeline'
import {
  EditableDetailGrid,
  type EditableEntry,
} from '@/components/structures/inline/EditableDetailGrid'
import { EditableHeading } from '@/components/structures/inline/EditableHeading'
import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { Section } from '@/components/structures/page/Section'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useRecordFile } from '@/core/hooks/data/work/useRecordFile'
import { SECTION_STYLES } from '@/declarations/ui/variants'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { cn } from '@/utils/classnames'
import { TASK_COPY, TASK_FIELD_COPY } from '@/declarations/work/copy'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { FieldDefinition } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay } from '@/utils/format/dates'

export interface TaskFileProps {
  task: TaskSummary
  fields: FieldDefinition[]
  activity: ActivityEntry[]
  canUpdate: boolean
  canReadLogs: boolean
  viewerId: string
}

/**
 * File of one task — an overview edited in place
 * @param {TaskSummary} task - Card resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the task form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {boolean} canUpdate - Member may edit the task
 * @param {boolean} canReadLogs - Member may read the journal
 * @param {string} viewerId - Signed-in member
 * @return {JSX.Element}
 */

export const TaskFile = ({
  task,
  fields,
  activity,
  canUpdate: mayUpdate,
  canReadLogs,
  viewerId,
}: TaskFileProps) => {
  // The system keeps its own tasks, they can only be ticked
  const canUpdate = mayUpdate && !task.isSystem
  const file = useRecordFile({
    path: API_ROUTES.task(task.id),
    scope: WorkflowScopes.Task,
    initialValues: task.values,
  })

  const fieldByName = new Map(fields.map((field) => [field.name, field]))
  const fieldFor = (name: string): FieldDefinition => fieldByName.get(name)!

  // Option backing one select value
  const optionOf = (name: string) => {
    const value = file.values[name]

    return typeof value === 'string' && value
      ? (fieldFor(name).options?.find((option) => option.value === value) ?? null)
      : null
  }

  const titleValue = typeof file.values.title === 'string' ? file.values.title : task.title
  const descriptionValue =
    typeof file.values.description === 'string' ? file.values.description : ''
  const dueDateValue = typeof file.values.dueDate === 'string' ? file.values.dueDate : null
  const stateOption = optionOf('stateId')
  const priorityOption = optionOf('priorityId')
  const ownerOption = optionOf('ownerId')
  const projectOption = optionOf('projectId')
  const youtuberOptions = pickedOptions(fieldFor('youtuberIds'), file.values.youtuberIds)

  const infoEntries: EditableEntry[] = [
    { label: FIELD_COPY.id, display: <RecordId id={task.id} /> },
    {
      label: TASK_FIELD_COPY.state,
      field: fieldFor('stateId'),
      display: stateOption ? (
        <Status label={stateOption.label} accent={stateOption.accent} icon="statusDot" />
      ) : null,
    },
    {
      label: TASK_FIELD_COPY.priority,
      field: fieldFor('priorityId'),
      display: priorityOption ? (
        <span className="inline-flex items-center gap-2">
          <OptionMark mark="priority" option={priorityOption} />
          <Status label={priorityOption.label} accent={priorityOption.accent} tone="warning" />
        </span>
      ) : null,
    },
    {
      label: TASK_FIELD_COPY.owner,
      field: fieldFor('ownerId'),
      display: ownerOption ? (
        <span className="flex items-center gap-2">
          <Avatar name={ownerOption.label} src={ownerOption.image} size="xs" />
          {ownerOption.label}
        </span>
      ) : null,
    },
    {
      label: TASK_FIELD_COPY.project,
      field: fieldFor('projectId'),
      display: projectOption ? (
        <ProjectLabel title={projectOption.label} emoji={projectOption.emoji} />
      ) : null,
    },
    {
      label: TASK_FIELD_COPY.youtubers,
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
      label: TASK_FIELD_COPY.dueDate,
      field: fieldFor('dueDate'),
      display: dueDateValue ? (
        <span className="inline-flex items-center gap-3">
          <Status
            label={formatDay(dueDateValue)}
            tone={task.isOverdue ? 'danger' : 'neutral'}
            icon="deadline"
          />
          {task.isOverdue && <OverdueMark kind="task" />}
        </span>
      ) : null,
    },
  ]

  // Neutral box
  const boxClass =
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 sm:p-5'

  return (
    <div className="flex flex-col gap-8">
      {/* Memora offers to update this task when the chat opens */}
      {canUpdate && (
        <FloatingFocus
          scenario="task"
          entry="onFile"
          data={{ taskId: task.id, name: task.title }}
        />
      )}
      <EditableHeading
        value={titleValue}
        lead={
          <TaskCheck
            id={task.id}
            isDone={task.isDone}
            enabled={mayUpdate || task.owner?.id === viewerId}
          />
        }
        disabled={!canUpdate}
        onCommit={(next) => file.saveField('title', next)}
      />

      {task.isSystem && (
        <div className="flex flex-wrap items-center gap-3">
          <Status label={TASK_COPY.systemTag} tone="danger" />
          <span className="text-sm text-[var(--color-ink-subtle)]">{TASK_COPY.systemInfo}</span>
          {task.href && (
            <Link href={task.href} className="text-sm font-semibold underline">
              {TASK_COPY.openSystem}
            </Link>
          )}
        </div>
      )}

      <section className={SECTION_STYLES.wrapper}>
        <h2 className={SECTION_STYLES.title}>{TASK_COPY.informations}</h2>
        <div className={boxClass}>
          <EditableDetailGrid
            entries={infoEntries}
            values={file.values}
            issues={file.issues}
            disabled={!canUpdate}
            onCommit={file.saveField}
          />
          <h3 className={SECTION_STYLES.wellTitle}>{TASK_FIELD_COPY.description}</h3>
          <div className={SECTION_STYLES.well}>
            <InlineMarkdown
              id="task-description"
              value={descriptionValue}
              placeholder={TASK_COPY.descriptionEmpty}
              disabled={!canUpdate}
              maxLength={fieldFor('description').maxLength}
              onCommit={(next) => file.saveField('description', next.trim() === '' ? null : next)}
            />
          </div>
        </div>
      </section>

      <WorkComments kind="task" id={task.id} label={task.title} />

      {canReadLogs && (
        <Section title={TASK_COPY.logsTitle} bare>
          <div className="flex flex-col gap-4">
            {activity.length === 0 ? (
              <EmptyState
                figure="notes"
                title={TASK_COPY.logsEmptyTitle}
                description={TASK_COPY.logsEmptyDescription}
                action={<Status label={TASK_COPY.logsTitle} tone="neutral" />}
              />
            ) : (
              <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded)}>
                <ActivityTimeline entries={activity} />
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}
