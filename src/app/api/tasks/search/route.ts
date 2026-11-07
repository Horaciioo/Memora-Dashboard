import { createProtectedRoute } from '@/core/lib/http/route'
import { listTasks } from '@/core/services/work/TaskService'
import { workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'
import { foldText } from '@/utils/format/strings'

// Longest search and longest answer
const SEARCH_MAX_LENGTH = 100
const HITS_MAX = 20

export const GET = createProtectedRoute({
  permission: Permissions.TaskRead,
  descriptor: { summary: 'Find tasks by title', tags: ['tasks'] },
  handler: async ({ query, scope, session, access }) => {
    const text = foldText((query.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH)).trim()
    const tasks = await listTasks(await scope(), workViewer(session, access))

    // The system keeps its own tasks
    return tasks
      .filter((task) => !task.isSystem && foldText(task.title).includes(text))
      .slice(0, HITS_MAX)
      .map((task) => ({
        taskId: task.id,
        title: task.title,
        hint: task.state?.label ?? null,
      }))
  },
})
