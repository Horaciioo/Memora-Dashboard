import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeTask, taskFields, updateTask } from '@/core/services/work/TaskService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.TaskUpdate,
  descriptor: { summary: 'Edit a task', tags: ['tasks'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(await taskFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const task = await updateTask(params.id, parsed.values, await scope())

    await recordEvent({
      eventType: 'TaskUpdated',
      actorId: session.id,
      subjectId: task.owner?.id ?? null,
      targetType: 'task',
      targetId: task.id,
      summary: task.title,
    })

    return task
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.TaskDelete,
  descriptor: { summary: 'Drop a task', tags: ['tasks'] },
  handler: async ({ params, session, scope }) => {
    await removeTask(params.id, await scope())

    await recordEvent({
      eventType: 'TaskDeleted',
      actorId: session.id,
      targetType: 'task',
      targetId: params.id,
      summary: params.id,
    })

    return { id: params.id }
  },
})
