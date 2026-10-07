import { forbidden, invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createTask, listTasks, lockTaskValues, taskFields } from '@/core/services/work/TaskService'
import { assertProjectVisible, workViewer } from '@/core/services/work/visibility'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.TaskRead,
  descriptor: { summary: 'List tasks', tags: ['tasks'] },
  handler: async ({ scope, session, access }) =>
    listTasks(await scope(), workViewer(session, access)),
})

export const POST = createProtectedRoute({
  permission: Permissions.TaskCreate,
  status: 201,
  descriptor: { summary: 'Add a task', tags: ['tasks'] },
  handler: async ({ raw, session, scope, access }) => {
    const viewer = workViewer(session, access)
    const parsed = parseFormValues(await taskFields(await scope(), viewer), raw, {
      fillMissing: true,
    })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    // A member without the lead writes inside a project naming them
    const canManage = access.can(Permissions.TaskManage)
    const projectId = typeof parsed.values.projectId === 'string' ? parsed.values.projectId : ''
    if (!canManage) {
      if (!projectId) throw invalidInput([{ field: 'projectId', message: FORM_COPY.required }])
      await assertProjectVisible(projectId, viewer).catch(() => {
        throw forbidden()
      })
    }

    const values = canManage ? parsed.values : lockTaskValues(parsed.values)
    const task = await createTask(values, await scope(), session.id)

    await recordEvent({
      eventType: 'TaskCreated',
      actorId: session.id,
      subjectId: task.owner?.id ?? null,
      targetType: 'task',
      targetId: task.id,
      summary: task.title,
    })

    await notify({
      kind: 'TaskAssigned',
      recipients: [task.owner?.id],
      actorId: session.id,
      target: 'task',
      targetId: task.id,
      subject: task.title,
    })

    return task
  },
})
