import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createTask, listTasks, taskFields } from '@/core/services/work/TaskService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.TaskRead,
  descriptor: { summary: 'List tasks', tags: ['tasks'] },
  handler: async ({ scope }) => listTasks(await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.TaskCreate,
  status: 201,
  descriptor: { summary: 'Add a task', tags: ['tasks'] },
  handler: async ({ raw, session, scope }) => {
    const parsed = parseFormValues(await taskFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const task = await createTask(parsed.values, await scope())

    await recordEvent({
      eventType: 'TaskCreated',
      actorId: session.id,
      subjectId: task.owner?.id ?? null,
      targetType: 'task',
      targetId: task.id,
      summary: task.title,
    })

    return task
  },
})
