import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { derankMembers, resolveActor } from '@/core/services/members/admin'
import { recordEvent } from '@/core/services/system/ActivityService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { DepartureKinds } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Dismiss several moderators under one announcement', tags: ['members'] },
  handler: async (context) => {
    const ids = context.raw.ids
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === 'string')) {
      throw invalidInput([{ field: 'ids', message: FORM_COPY.notAnOption }])
    }

    const actor = await resolveActor(context)
    const departure = await derankMembers(ids as string[], actor)

    for (const id of new Set(ids as string[])) {
      await recordEvent({
        eventType: 'MemberDeparted',
        actorId: actor.id,
        subjectId: id,
        targetType: 'member',
        targetId: id,
        summary: DepartureKinds.Dismissal,
      })
    }

    return departure
  },
})
