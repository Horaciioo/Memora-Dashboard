'use client'

import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Glyph } from '@/components/elements/display/Glyph'
import { WorkBoard } from '@/composites/work/WorkBoard'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { BOARD_STYLES } from '@/declarations/ui/variants'

import { BOARD_FILTER_COPY, TASK_COPY } from '@/declarations/work/copy'
import type { BoardColumn } from '@/components/structures/KanbanBoard'
import type { DataTableColumn } from '@/components/structures/DataTable'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay, isOverdue } from '@/utils/format/dates'

export interface TasksBoardProps {
  initialTasks: TaskSummary[]
  columns: BoardColumn[]
  fields: FieldDefinition[]
  owners: FieldOption[]
  youtubers: FieldOption[]
  projects: FieldOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

/**
 * Task board, its cards carrying the owner
 * @param {TaskSummary[]} initialTasks - Cards resolved server-side
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {FieldDefinition[]} fields - Field declarations of the task form
 * @param {FieldOption[]} owners - Owner filter options
 * @param {FieldOption[]} youtubers - YouTuber filter options
 * @param {FieldOption[]} projects - Project filter options
 * @param {boolean} canCreate - Member may add a task
 * @param {boolean} canUpdate - Member may edit a task
 * @param {boolean} canDelete - Member may drop a task
 * @return {JSX.Element}
 */

export const TasksBoard = ({
  initialTasks,
  columns,
  fields,
  owners,
  youtubers,
  projects,
  canCreate,
  canUpdate,
  canDelete,
}: TasksBoardProps) => {
  const router = useRouter()

  const tableColumns: DataTableColumn<TaskSummary>[] = [
    {
      key: 'title',
      header: FIELD_COPY.title,
      sortValue: (task) => task.title.toLowerCase(),
      render: (task) => (
        <span className="font-medium">
          <Glyph value={task.emoji} size="row" className={BOARD_STYLES.cardGlyph} />
          {task.title}
        </span>
      ),
    },
    {
      key: 'owner',
      header: FIELD_COPY.lead,
      sortValue: (task) => task.owner?.name ?? '',
      render: (task) =>
        task.owner ? (
          <span className="flex items-center gap-2">
            <Avatar name={task.owner.name} src={task.owner.src} size="xs" />
            {task.owner.name}
          </span>
        ) : null,
    },
    {
      key: 'state',
      header: FIELD_COPY.state,
      sortValue: (task) => task.state?.label ?? '',
      render: (task) =>
        task.state ? <Badge label={task.state.label} accent={task.state.accent} dot /> : null,
    },
    {
      key: 'project',
      header: FIELD_COPY.project,
      render: (task) => (task.project ? <Badge label={task.project.label} tone="brand" /> : null),
    },
    {
      key: 'youtuber',
      header: FIELD_COPY.youtuber,
      render: (task) =>
        task.youtuber ? (
          <Badge label={task.youtuber.label} accent={task.youtuber.accent} tone={'info'} />
        ) : null,
    },
    {
      key: 'dueDate',
      header: FIELD_COPY.date,
      sortValue: (task) => task.dueDate ?? '',
      className: 'whitespace-nowrap',
      render: (task) =>
        task.dueDate ? (
          <Badge
            label={formatDay(task.dueDate)}
            tone={isOverdue(task.dueDate) ? 'danger' : 'neutral'}
            icon="clock"
          />
        ) : null,
    },
  ]

  return (
    <WorkBoard<TaskSummary>
      scope={WorkflowScopes.Task}
      endpoints={{ collection: API_ROUTES.tasks, item: API_ROUTES.task }}
      initialCards={initialTasks}
      columns={columns}
      fields={fields}
      columnField="stateId"
      copy={TASK_COPY}
      figure="tasks"
      tableColumns={tableColumns}
      filters={[
        {
          name: 'owner',
          label: BOARD_FILTER_COPY.owner,
          allLabel: BOARD_FILTER_COPY.allOwners,
          options: owners,
          mark: 'avatar',
        },
        {
          name: 'youtuber',
          label: BOARD_FILTER_COPY.youtuber,
          allLabel: BOARD_FILTER_COPY.allYoutubers,
          options: youtubers,
          mark: 'avatar',
        },
        {
          name: 'project',
          label: BOARD_FILTER_COPY.project,
          allLabel: BOARD_FILTER_COPY.allProjects,
          options: projects,
        },
      ]}
      matches={(task, search, filters) => {
        if (search.length > 0 && !task.title.toLowerCase().includes(search)) return false
        if (filters.owner && task.owner?.id !== filters.owner) return false
        if (filters.youtuber && task.youtuber?.id !== filters.youtuber) return false
        if (filters.project && task.project?.id !== filters.project) return false

        return true
      }}
      valuesOf={(task) => task.values}
      labelOf={(task) => task.title}
      onOpen={(task) => router.push(ROUTES.task(task.id))}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      tintByColumn
      renderCard={(task) => (
        <p className={BOARD_STYLES.cardTitle}>
          <Glyph value={task.emoji} size="row" className={BOARD_STYLES.cardGlyph} />
          {task.title}
        </p>
      )}
    />
  )
}
