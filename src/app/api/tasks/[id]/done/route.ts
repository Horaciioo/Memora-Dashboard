import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readTask, setTaskDone } from '@/core/services/work/TaskService'
import { assertTaskVisible, workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.TaskRead,
  descriptor: { summary: 'Tick a task done or undone', tags: ['tasks'] },
  handler: async ({ params, raw, session, access }) => {
    await assertTaskVisible(params.id, workViewer(session, access))

    // Whoever holds a task ticks it, anyone else needs the right to edit
    const task = await readTask(params.id)
    if (task.owner?.id !== session.id && !access.can(Permissions.TaskUpdate)) throw forbidden()

    return setTaskDone(params.id, raw.done === true, session.id)
  },
})
