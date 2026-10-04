import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { moveOnRoster, readLiveRoster } from '@/core/services/lives/RosterService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the roll-call of a live', tags: ['lives'] },
  handler: async ({ params, session, scope }) =>
    readLiveRoster(params.id, await scope(), session.id, session.permissions),
})

export const PATCH = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Move a member on the roll-call of a live', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    const accountId = String(raw.accountId ?? '')
    const status = String(raw.status ?? '')
    if (!accountId || !ATTENDANCE_STATUS_REGISTRY.has(status)) {
      throw invalidInput([{ field: 'status', message: FORM_COPY.notAnOption }])
    }

    // Coordinator rights are folded in by the service
    const roster = await moveOnRoster({
      id: params.id,
      accountId,
      status: status as AttendanceStatusName,
      scope: await scope(),
      viewerId: session.id,
      held: session.permissions,
    })

    await recordEvent({
      eventType: 'LiveRosterMoved',
      actorId: session.id,
      subjectId: accountId,
      targetType: 'live',
      targetId: params.id,
      summary: ATTENDANCE_STATUS_REGISTRY.label(status as AttendanceStatusName),
    })

    return roster
  },
})
