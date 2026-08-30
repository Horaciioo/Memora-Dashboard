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
import { summariseChange } from '@/core/services/system/changes'
import { notify } from '@/core/services/system/NotificationService'
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
    const perimeter = await scope()
    const fields = await projectFields(perimeter)

    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const before = await readProject(params.id)
    const project = await updateProject(params.id, parsed.values, perimeter, session.id)

    await recordEvent({
      eventType: 'ProjectUpdated',
      actorId: session.id,
      targetType: 'project',
      targetId: project.id,
      summary: project.title,
      change: summariseChange(fields, before.summary.values, project.values),
    })

    await notify({
      kind: 'ProjectAssigned',
      recipients: [...project.leads, ...project.assistants].map((person) => person.id),
      actorId: session.id,
      target: 'project',
      targetId: project.id,
      subject: project.title,
      once: true,
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
