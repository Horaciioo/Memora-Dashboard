import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createProject, listProjects, projectFields } from '@/core/services/work/ProjectService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.ProjectRead,
  descriptor: { summary: 'List projects', tags: ['projects'] },
  handler: async ({ scope }) => listProjects(await scope()),
})

export const POST = createProtectedRoute({
  permission: Permissions.ProjectCreate,
  status: 201,
  descriptor: { summary: 'Open a project', tags: ['projects'] },
  handler: async ({ raw, session, scope }) => {
    const parsed = parseFormValues(await projectFields(await scope()), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const project = await createProject(parsed.values, await scope(), session.id)

    await recordEvent({
      eventType: 'ProjectCreated',
      actorId: session.id,
      targetType: 'project',
      targetId: project.id,
      summary: project.title,
    })

    return project
  },
})
