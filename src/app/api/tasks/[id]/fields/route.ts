import { createProtectedRoute } from '@/core/lib/http/route'
import { lockTaskFields, readTask, taskFields } from '@/core/services/work/TaskService'
import { assertTaskVisible, workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.TaskUpdate,
  descriptor: { summary: 'Read a task with the fields its viewer may edit', tags: ['tasks'] },
  handler: async ({ params, scope, session, access }) => {
    const viewer = workViewer(session, access)
    const fields = await taskFields(await scope(), viewer)

    await assertTaskVisible(params.id, viewer)

    return {
      // Owner, state and deadline are a manager's to move
      fields: access.can(Permissions.TaskManage) ? fields : lockTaskFields(fields),
      task: await readTask(params.id),
    }
  },
})
