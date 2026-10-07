import { forbidden, invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  communicationFields,
  communicationOwner,
  removeCommunication,
  updateCommunication,
} from '@/core/services/work/ProjectService'
import { assertProjectVisible, workViewer } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Refuse an announcement the viewer neither reaches nor wrote
 * @param {string} id - Announcement identifier
 * @param {WorkViewer} viewer - Who writes
 * @return {Promise<void>} - Throws when refused
 */

const assertWritable = async (id: string, viewer: WorkViewer): Promise<void> => {
  const owner = await communicationOwner(id)
  await assertProjectVisible(owner.projectId, viewer)

  // Others only touch their own
  if (!viewer.seesAll && owner.authorId !== viewer.id) throw forbidden()
}

export const PATCH = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  descriptor: { summary: 'Edit a project announcement', tags: ['projects'] },
  handler: async ({ params, raw, session, access }) => {
    await assertWritable(params.id, workViewer(session, access))

    const parsed = parseFormValues(await communicationFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateCommunication(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  descriptor: { summary: 'Drop a project announcement', tags: ['projects'] },
  handler: async ({ params, session, access }) => {
    await assertWritable(params.id, workViewer(session, access))
    await removeCommunication(params.id)

    return { id: params.id }
  },
})
