import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { departMember, resolveActor } from '@/core/services/members/admin'
import { recordEvent } from '@/core/services/system/ActivityService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { DepartureKinds } from '@/utils/constants/hierarchy'
import type { DepartureKindName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Let a moderator go by dismissal or resignation', tags: ['members'] },
  handler: async (context) => {
    const kind = Object.values(DepartureKinds).find((entry) => entry === context.raw.kind) as
      DepartureKindName | undefined
    if (!kind) throw invalidInput([{ field: 'kind', message: FORM_COPY.notAnOption }])

    const actor = await resolveActor(context)
    const departure = await departMember(context.params.id, kind, actor)

    await recordEvent({
      eventType: 'MemberDeparted',
      actorId: actor.id,
      subjectId: context.params.id,
      targetType: 'member',
      targetId: context.params.id,
      summary: kind,
    })

    return departure
  },
})
