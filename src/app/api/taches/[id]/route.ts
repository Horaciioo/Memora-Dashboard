import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readTask, removeTask, taskFields, updateTask } from '@/core/services/work/TaskService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { summariseChange } from '@/core/services/system/changes'
import { notify } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.TaskUpdate,
  descriptor: { summary: 'Edit a task', tags: ['tasks'] },
  handler: async ({ params, raw, session, scope }) => {
    const perimeter = await scope()
    const fields = await taskFields(perimeter)

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const before = await readTask(params.id)
    const task = await updateTask(params.id, parsed.values, perimeter, session.id)

    await recordEvent({
      eventType: 'TaskUpdated',
      actorId: session.id,
      subjectId: task.owner?.id ?? null,
      targetType: 'task',
      targetId: task.id,
      summary: task.title,
      change: summariseChange(fields, before.values, task.values),
    })

    await notify({
      kind: 'TaskAssigned',
      recipients: [task.owner?.id],
      actorId: session.id,
      target: 'task',
      targetId: task.id,
      subject: task.title,
      once: true,
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
