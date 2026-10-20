'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { CreatorLabels, ProjectLabel } from '@/components/elements/display/RecordLabel'
import { OverdueMark } from '@/composites/work/OverdueMark'
import { TaskCheck } from '@/composites/work/TaskCheck'
import { WorkBoard } from '@/composites/work/WorkBoard'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { BOARD_STYLES } from '@/declarations/ui/variants'

import { BOARD_FILTER_COPY, TASK_COPY } from '@/declarations/work/copy'
import type { BoardColumn } from '@/components/structures/data/KanbanBoard'
import type { DataTableColumn } from '@/components/structures/data/DataTable'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay } from '@/utils/format/dates'

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
  viewerId: string
}

/**
 * Task board
 * @param {TaskSummary[]} initialTasks - Cards resolved server-side
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {FieldDefinition[]} fields - Field declarations of the task form
 * @param {FieldOption[]} owners - Owner filter options
 * @param {FieldOption[]} youtubers - YouTuber filter options
 * @param {FieldOption[]} projects - Project filter options
 * @param {boolean} canCreate - Member may add a task
 * @param {boolean} canUpdate - Member may edit a task
 * @param {boolean} canDelete - Member may drop a task
 * @param {string} viewerId - Signed-in member
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
  viewerId,
}: TasksBoardProps) => {
  const router = useRouter()
  // The home links the tasks of the member
  const ownerParam = useSearchParams().get('owner')
  const initialOwner = ownerParam === 'me' ? viewerId : ownerParam

  // The check leads the title, with the system tag after it
  const titleOf = (task: TaskSummary) => (
    <>
      <TaskCheck
        id={task.id}
        isDone={task.isDone}
        enabled={canUpdate || task.owner?.id === viewerId}
      />
      {task.title}
    </>
  )

  // System tag sitting above the title
  const systemTag = (task: TaskSummary) =>
    task.isSystem ? (
      <Status label={TASK_COPY.systemTag} tone="danger" className="mb-1 flex" />
    ) : null

  const tableColumns: DataTableColumn<TaskSummary>[] = [
    {
      key: 'title',
      header: FIELD_COPY.title,
      sortValue: (task) => task.title.toLowerCase(),
      render: (task) => (
        <span className="block font-medium">
          {systemTag(task)}
          {titleOf(task)}
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
        task.state ? (
          <Status label={task.state.label} accent={task.state.accent} icon="statusDot" />
        ) : null,
    },
    {
      key: 'project',
      header: FIELD_COPY.project,
      render: (task) =>
        task.project ? (
          <ProjectLabel title={task.project.label} emoji={task.project.emoji} />
        ) : null,
    },
    {
      key: 'youtuber',
      header: FIELD_COPY.youtuber,
      render: (task) => (
        <CreatorLabels
          creators={task.youtubers.map((youtuber) => ({
            name: youtuber.label,
            image: youtuber.image,
          }))}
        />
      ),
    },
    {
      key: 'dueDate',
      header: FIELD_COPY.date,
      sortValue: (task) => task.dueDate ?? '',
      className: 'whitespace-nowrap',
      render: (task) =>
        task.dueDate ? (
          <span className="inline-flex items-center gap-2">
            <Status
              label={formatDay(task.dueDate)}
              tone={task.isOverdue ? 'danger' : 'neutral'}
              icon="clock"
            />
            {task.isOverdue && <OverdueMark kind="task" />}
          </span>
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
        if (filters.youtuber && !task.youtubers.some((item) => item.id === filters.youtuber))
          return false
        if (filters.project && task.project?.id !== filters.project) return false

        return true
      }}
      valuesOf={(task) => task.values}
      labelOf={(task) => task.title}
      onOpen={(task) => router.push(ROUTES.task(task.id))}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      isRemovable={(task) => !task.isSystem}
      initialFilters={initialOwner ? { owner: initialOwner } : undefined}
      tintByColumn
      renderCard={(task) => (
        <>
          <div>
            {systemTag(task)}
            <p className={BOARD_STYLES.cardTitle}>{titleOf(task)}</p>
          </div>
          <p className={BOARD_STYLES.cardOrigin}>
            {task.project ? (
              <ProjectLabel title={task.project.label} emoji={task.project.emoji} />
            ) : (
              TASK_COPY.noProject
            )}
          </p>
        </>
      )}
    />
  )
}
