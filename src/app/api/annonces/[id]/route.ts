import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  announcementFields,
  assertWritable,
  editAnnouncement,
} from '@/core/services/work/AnnouncementService'
import { removeCommunication } from '@/core/services/work/ProjectService'
import { projectOptions } from '@/core/services/work/shared'
import { workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  descriptor: { summary: 'Edit an announcement', tags: ['projects'] },
  handler: async ({ params, raw, session, scope, access }) => {
    const viewer = workViewer(session, access)
    await assertWritable(params.id, viewer)

    const fields = await announcementFields([], await projectOptions(await scope(), viewer))
    const parsed = parseFormValues(fields, raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return editAnnouncement(params.id, parsed.values, viewer)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  descriptor: { summary: 'Drop an announcement', tags: ['projects'] },
  handler: async ({ params, session, access }) => {
    await assertWritable(params.id, workViewer(session, access))
    await removeCommunication(params.id)

    return { id: params.id }
  },
})
