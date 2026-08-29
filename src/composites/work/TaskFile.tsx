'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { EditableDetailGrid, type EditableEntry } from '@/components/structures/EditableDetailGrid'
import { EditableHeading } from '@/components/structures/EditableHeading'
import { Section } from '@/components/structures/Section'
import { API_ROUTES } from '@/core/lib/api/routes'
import { AuthorshipStrip } from '@/composites/work/authorship'
import { useRecordFile } from '@/core/hooks/data/useRecordFile'
import { SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { TASK_COPY, TASK_FIELD_COPY } from '@/declarations/work/copy'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { FieldDefinition } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay, isOverdue } from '@/utils/format/dates'

export interface TaskFileProps {
  task: TaskSummary
  fields: FieldDefinition[]
  activity: ActivityEntry[]
  canUpdate: boolean
}

/**
 * File of one task — an overview edited in place, then the journal, both stacked rather
 * than tabbed since a task carries nothing else
 * @param {TaskSummary} task - Card resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the task form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {boolean} canUpdate - Member may edit the task
 * @return {JSX.Element}
 */

export const TaskFile = ({ task, fields, activity, canUpdate }: TaskFileProps) => {
  const file = useRecordFile({
    path: API_ROUTES.task(task.id),
    scope: WorkflowScopes.Task,
    initialValues: task.values,
  })

  const fieldByName = new Map(fields.map((field) => [field.name, field]))
  const fieldFor = (name: string): FieldDefinition => fieldByName.get(name)!

  // Option backing one select value, feeding the read rendering of the grid
  const optionOf = (name: string) => {
    const value = file.values[name]

    return typeof value === 'string' && value
      ? (fieldFor(name).options?.find((option) => option.value === value) ?? null)
      : null
  }

  const titleValue = typeof file.values.title === 'string' ? file.values.title : task.title
  const emojiValue = typeof file.values.emoji === 'string' ? file.values.emoji : task.emoji
  const descriptionValue =
    typeof file.values.description === 'string' ? file.values.description : null
  const dueDateValue = typeof file.values.dueDate === 'string' ? file.values.dueDate : null
  const stateOption = optionOf('stateId')
  const priorityOption = optionOf('priorityId')
  const ownerOption = optionOf('ownerId')
  const projectOption = optionOf('projectId')
  const youtuberOption = optionOf('youtuberId')

  const infoEntries: EditableEntry[] = [
    {
      label: TASK_FIELD_COPY.state,
      field: fieldFor('stateId'),
      display: stateOption ? (
        <Badge label={stateOption.label} accent={stateOption.accent} dot />
      ) : null,
    },
    {
      label: TASK_FIELD_COPY.priority,
      field: fieldFor('priorityId'),
      display: priorityOption ? (
        <Badge label={priorityOption.label} accent={priorityOption.accent} tone="warning" />
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
        <Badge label={projectOption.label} tone="brand" icon="projects" />
      ) : null,
    },
    {
      label: TASK_FIELD_COPY.youtuber,
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
      label: TASK_FIELD_COPY.dueDate,
      field: fieldFor('dueDate'),
      display: dueDateValue ? (
        <Badge
          label={formatDay(dueDateValue)}
          tone={isOverdue(dueDateValue) ? 'danger' : 'neutral'}
          icon="deadline"
        />
      ) : null,
    },
    {
      label: TASK_FIELD_COPY.description,
      field: fieldFor('description'),
      display: descriptionValue ? (
        <span className="whitespace-pre-line">{descriptionValue}</span>
      ) : null,
    },
  ]

  // Neutral box, state colour on its badges
  const boxClass =
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5'

  return (
    <div className="flex flex-col gap-8">
      <EditableHeading
        value={titleValue}
        glyph={emojiValue}
        disabled={!canUpdate}
        onCommit={(next) => file.saveField('title', next)}
        onGlyphCommit={(next) => file.saveField('emoji', next)}
      />

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
        </div>
      </section>

      <Section title={TASK_COPY.logsTitle} bare>
        <div className="flex flex-col gap-4">
          <AuthorshipStrip record={task} />
          {activity.length === 0 ? (
            <EmptyState
              figure="notes"
              title={TASK_COPY.logsEmptyTitle}
              description={TASK_COPY.logsEmptyDescription}
              action={<Badge label={TASK_COPY.logsTitle} tone="neutral" />}
            />
          ) : (
            <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded)}>
              <ActivityTimeline entries={activity} />
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
