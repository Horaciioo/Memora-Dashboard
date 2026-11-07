import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { editGesture, removeGesture } from '@/core/services/lives/LiveDataService'
import { readLive } from '@/core/services/lives/LiveService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.LiveLogRead,
  descriptor: { summary: 'Correct one gesture of a live', tags: ['lives'] },
  handler: async ({ params, raw, session, access, scope }) => {
    if (!access.isResponsable) throw forbidden()
    await readLive(params.id, await scope(), session.id, session.permissions)

    await editGesture(params.id, params.actionId, {
      ...(typeof raw.kind === 'string' && { kind: raw.kind }),
      ...('targetLogin' in raw && {
        targetLogin: raw.targetLogin ? String(raw.targetLogin) : null,
      }),
      ...('durationSeconds' in raw && {
        durationSeconds: raw.durationSeconds === null ? null : Number(raw.durationSeconds),
      }),
      ...('reason' in raw && { reason: raw.reason ? String(raw.reason) : null }),
    })

    return { id: params.actionId }
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.LiveLogRead,
  descriptor: { summary: 'Erase one gesture of a live', tags: ['lives'] },
  handler: async ({ params, session, access, scope }) => {
    if (!access.isResponsable) throw forbidden()
    await readLive(params.id, await scope(), session.id, session.permissions)
    await removeGesture(params.id, params.actionId)

    return { id: params.actionId }
  },
})
