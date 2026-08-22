import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { moveMeeting } from '@/core/services/work/MeetingService'
import { moveProject } from '@/core/services/work/ProjectService'
import { moveTask } from '@/core/services/work/TaskService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: [Permissions.ProjectUpdate, Permissions.TaskUpdate, Permissions.MeetingUpdate],
  descriptor: { summary: 'Move a board card', tags: ['boards'] },
  handler: async ({ raw, access }) => {
    const scope = String(raw.scope ?? '')
    const id = String(raw.id ?? '')
    const columnId = String(raw.columnId ?? '')
    const index = Number(raw.index ?? 0)

    if (!id || !columnId) throw invalidInput([{ field: 'id', message: FORM_COPY.required }])

    // Each board is gated by the permission that edits its own resource
    if (scope === WorkflowScopes.Project && access.can(Permissions.ProjectUpdate)) {
      return moveProject(id, columnId, index)
    }

    if (scope === WorkflowScopes.Task && access.can(Permissions.TaskUpdate)) {
      return moveTask(id, columnId, index)
    }

    if (scope === WorkflowScopes.Meeting && access.can(Permissions.MeetingUpdate)) {
      return moveMeeting(id, columnId, index)
    }

    throw invalidInput([{ field: 'scope', message: FORM_COPY.notAnOption }])
  },
})
