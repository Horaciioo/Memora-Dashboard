import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  communicationFields,
  removeCommunication,
  updateCommunication,
} from '@/core/services/work/ProjectService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  descriptor: { summary: 'Edit a project announcement', tags: ['projects'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(await communicationFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateCommunication(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.CommunicationWrite,
  descriptor: { summary: 'Drop a project announcement', tags: ['projects'] },
  handler: async ({ params }) => {
    await removeCommunication(params.id)

    return { id: params.id }
  },
})
