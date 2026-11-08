import { createProtectedRoute } from '@/core/lib/http/route'
import { reopenLive } from '@/core/services/lives/LiveService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { LIVE_STATUS_REGISTRY } from '@/declarations/lives/registries'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Put back a live closed too soon', tags: ['lives'] },
  handler: async ({ params, session, scope }) => {
    const live = await reopenLive(params.id, session.id, session.permissions, await scope())

    await recordEvent({
      eventType: 'LiveMoved',
      actorId: session.id,
      targetType: 'live',
      targetId: params.id,
      summary: LIVE_STATUS_REGISTRY.label(LiveStatuses.Live),
    })

    return live
  },
})
