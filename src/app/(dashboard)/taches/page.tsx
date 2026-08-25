import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { TasksBoard } from '@/composites/work/TasksBoard'
import { listTasks, taskFields } from '@/core/services/work/TaskService'
import {
  boardColumns,
  memberOptions,
  projectOptions,
  youtuberOptions,
} from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { TASK_COPY } from '@/declarations/work/copy'
import { Permissions } from '@/utils/constants/permissions'
import { WorkflowScopes } from '@/utils/constants/workflow'

export const metadata: Metadata = { title: TASK_COPY.title }

/**
 * Task board
 * @return {Promise<JSX.Element>} - Board page
 */

export default async function TasksPage() {
  const { access, scope } = await requirePermission(Permissions.TaskRead)
  const perimeter = await scope()

  const [tasks, columns, fields, owners, youtubers, projects] = await Promise.all([
    listTasks(perimeter),
    boardColumns(WorkflowScopes.Task),
    taskFields(perimeter),
    memberOptions(),
    youtuberOptions(),
    projectOptions(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={TASK_COPY.title} lead={TASK_COPY.lead} />
      <TasksBoard
        initialTasks={tasks}
        columns={columns}
        fields={fields}
        owners={owners}
        youtubers={youtubers}
        projects={projects}
        canCreate={access.can(Permissions.TaskCreate)}
        canUpdate={access.can(Permissions.TaskUpdate)}
        canDelete={access.can(Permissions.TaskDelete)}
      />
    </div>
  )
}
