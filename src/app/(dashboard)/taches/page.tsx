import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { TasksBoard } from '@/composites/work/TasksBoard'
import { busySlots, withBusy } from '@/core/services/calendar/BusyService'
import { creatableTaskFields, listTasks, taskFields } from '@/core/services/work/TaskService'
import {
  boardColumns,
  memberOptions,
  projectOptions,
  youtuberOptions,
} from '@/core/services/work/shared'
import { workViewer } from '@/core/services/work/visibility'
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
  const { session, access, scope } = await requirePermission(Permissions.TaskRead)
  const perimeter = await scope()
  const viewer = workViewer(session, access)

  const [tasks, columns, baseFields, slots, owners, youtubers, projects] = await Promise.all([
    listTasks(perimeter, viewer),
    boardColumns(WorkflowScopes.Task),
    taskFields(perimeter, viewer),
    busySlots({ viewerId: session.id, access, scope: perimeter }),
    memberOptions(),
    youtuberOptions(),
    projectOptions(perimeter, viewer),
  ])

  const canManage = access.can(Permissions.TaskManage)
  const fields = withBusy(
    canManage ? baseFields : creatableTaskFields(baseFields),
    ['dueDate'],
    slots
  )

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={TASK_COPY.title} />
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
