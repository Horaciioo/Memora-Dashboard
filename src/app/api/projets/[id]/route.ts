import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  projectFields,
  readProject,
  removeProject,
  updateProject,
} from '@/core/services/work/ProjectService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.ProjectRead,
  descriptor: { summary: 'Read a project file', tags: ['projects'] },
  handler: ({ params }) => readProject(params.id),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.ProjectUpdate,
  descriptor: { summary: 'Edit a project', tags: ['projects'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(await projectFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const project = await updateProject(params.id, parsed.values, await scope(), session.id)

    await recordEvent({
      eventType: 'ProjectUpdated',
      actorId: session.id,
      targetType: 'project',
      targetId: project.id,
      summary: project.title,
    })

    return project
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ProjectDelete,
  descriptor: { summary: 'Drop a project', tags: ['projects'] },
  handler: async ({ params, session, scope }) => {
    const project = await readProject(params.id)
    await removeProject(params.id, await scope())

    await recordEvent({
      eventType: 'ProjectDeleted',
      actorId: session.id,
      targetType: 'project',
      targetId: params.id,
      summary: project.summary.title,
    })

    return { id: params.id }
  },
})
