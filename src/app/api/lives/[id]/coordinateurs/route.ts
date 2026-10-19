import { createProtectedRoute } from '@/core/lib/http/route'
import {
  readCoordinatorChoices,
  setLiveCoordinators,
} from '@/core/services/lives/CoordinatorEditService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveAnnounce,
  descriptor: { summary: 'Read who may coordinate a live', tags: ['lives'] },
  handler: async ({ params, scope }) => readCoordinatorChoices(params.id, await scope()),
})

export const PUT = createProtectedRoute({
  permission: Permissions.LiveAnnounce,
  descriptor: { summary: 'Replace the Coordinators of a live', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    const accountIds = Array.isArray(raw.accountIds)
      ? raw.accountIds.filter((id): id is string => typeof id === 'string')
      : []

    await setLiveCoordinators({
      liveId: params.id,
      accountIds,
      actorId: session.id,
      scope: await scope(),
    })

    await recordEvent({
      eventType: 'LiveCoordinatorsChanged',
      actorId: session.id,
      targetType: 'live',
      targetId: params.id,
      summary: String(accountIds.length),
    })

    // A null answer reads as a failure client side
    return { saved: true }
  },
})
