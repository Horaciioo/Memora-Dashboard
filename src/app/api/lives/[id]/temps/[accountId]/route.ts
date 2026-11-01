import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { editModTime } from '@/core/services/lives/LiveDataService'
import { readLive } from '@/core/services/lives/LiveService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.LiveLogRead,
  descriptor: { summary: 'Correct the time a member moderated a live', tags: ['lives'] },
  handler: async ({ params, raw, session, access, scope }) => {
    if (!access.isResponsable) throw forbidden()
    await readLive(params.id, await scope(), session.id, session.permissions)
    await editModTime(params.id, params.accountId, Number(raw.activeSeconds))

    return { id: params.accountId }
  },
})
