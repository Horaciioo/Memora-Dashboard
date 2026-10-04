import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { listFocuses, startFocus, stopFocus } from '@/core/services/lives/FocusService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the Focus open on a live', tags: ['lives'] },
  handler: async ({ params, session, scope }) =>
    listFocuses({
      liveId: params.id,
      scope: await scope(),
      viewerId: session.id,
      role: session.role,
    }),
})

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Follow a moderator on a live', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    const targetId = typeof raw.targetId === 'string' ? raw.targetId : ''
    if (!targetId) throw invalidInput([{ field: 'targetId', message: FORM_COPY.required }])

    const perimeter = await scope()
    await startFocus({
      liveId: params.id,
      targetId,
      scope: perimeter,
      viewerId: session.id,
      role: session.role,
      held: session.permissions,
    })

    await recordEvent({
      eventType: 'LiveFocused',
      actorId: session.id,
      subjectId: targetId,
      targetType: 'live',
      targetId: params.id,
      summary: targetId,
    })

    return listFocuses({
      liveId: params.id,
      scope: perimeter,
      viewerId: session.id,
      role: session.role,
    })
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Stop following on a live', tags: ['lives'] },
  handler: async ({ params, session, scope }) => {
    await stopFocus(params.id, session.id)

    return listFocuses({
      liveId: params.id,
      scope: await scope(),
      viewerId: session.id,
      role: session.role,
    })
  },
})
