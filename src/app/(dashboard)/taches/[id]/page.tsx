import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TaskFile } from '@/composites/work/TaskFile'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import { readTask, taskFields } from '@/core/services/work/TaskService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { TASK_COPY } from '@/declarations/work/copy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the task
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const task = await readTask(id)

    return { title: task.title }
  } catch {
    return { title: TASK_COPY.title }
  }
}

/**
 * Task file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Detail page
 */

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access, scope } = await requirePermission(Permissions.TaskRead)
  const perimeter = await scope()

  const task = await readTask(id).catch(() => null)
  if (!task) notFound()

  const [fields, activity] = await Promise.all([
    taskFields(perimeter),
    readRecordActivity('task', id),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <TaskFile
        task={task}
        fields={fields}
        activity={activity}
        canUpdate={access.can(Permissions.TaskUpdate)}
      />
    </div>
  )
}
