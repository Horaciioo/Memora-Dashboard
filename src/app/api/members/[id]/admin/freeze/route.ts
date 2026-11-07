import { createProtectedRoute } from '@/core/lib/http/route'
import { freezeMember, resolveActor, unfreezeMember } from '@/core/services/members/admin'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Freeze a moderator access', tags: ['members'] },
  handler: async (context) => {
    const actor = await resolveActor(context)
    await freezeMember(context.params.id, actor)

    await recordEvent({
      eventType: 'MemberFrozen',
      actorId: actor.id,
      subjectId: context.params.id,
      targetType: 'member',
      targetId: context.params.id,
      summary: context.params.id,
    })

    return { id: context.params.id }
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Give a frozen moderator their access back', tags: ['members'] },
  handler: async (context) => {
    const actor = await resolveActor(context)
    await unfreezeMember(context.params.id, actor)

    await recordEvent({
      eventType: 'MemberThawed',
      actorId: actor.id,
      subjectId: context.params.id,
      targetType: 'member',
      targetId: context.params.id,
      summary: context.params.id,
    })

    return { id: context.params.id }
  },
})
