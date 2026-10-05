import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { moveLive, readLive } from '@/core/services/lives/LiveService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { LIVE_STATUS_REGISTRY } from '@/declarations/lives/registries'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'
import type { LiveStatusName } from '@/utils/constants/lives'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read one live', tags: ['lives'] },
  handler: async ({ params, session, scope }) =>
    readLive(params.id, await scope(), session.id, session.permissions),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Start, end or cancel a live', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    const status = String(raw.status ?? '')
    if (!LIVE_STATUS_REGISTRY.has(status)) {
      throw invalidInput([{ field: 'status', message: FORM_COPY.notAnOption }])
    }

    // Announcers move a live by hand
    const perimeter = await scope()
    const live = await readLive(params.id, perimeter, session.id, session.permissions)
    const isCoordinator = live.coordinator?.id === session.id
    if (!session.permissions.includes(Permissions.LiveAnnounce) && !isCoordinator) {
      throw forbidden()
    }

    await moveLive(params.id, status as LiveStatusName, session.id, perimeter)

    await recordEvent({
      eventType: 'LiveMoved',
      actorId: session.id,
      targetType: 'live',
      targetId: params.id,
      summary: LIVE_STATUS_REGISTRY.label(status as LiveStatusName),
    })

    return readLive(params.id, perimeter, session.id, session.permissions)
  },
})
