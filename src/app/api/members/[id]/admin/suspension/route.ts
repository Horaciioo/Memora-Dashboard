import { createProtectedRoute } from '@/core/lib/http/route'
import { liftSuspension, resolveActor, suspendLives } from '@/core/services/members/admin'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  status: 201,
  descriptor: { summary: 'Suspend a moderator from the lives until a day', tags: ['members'] },
  handler: async (context) => {
    const actor = await resolveActor(context)
    const until = typeof context.raw.until === 'string' ? context.raw.until : ''
    const reason =
      typeof context.raw.reason === 'string'
        ? context.raw.reason.trim().slice(0, 500) || null
        : null

    const suspension = await suspendLives(context.params.id, { until, reason }, actor)

    await recordEvent({
      eventType: 'LiveSuspended',
      actorId: actor.id,
      subjectId: context.params.id,
      targetType: 'member',
      targetId: context.params.id,
      summary: until,
    })

    return suspension
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.MemberUpdate,
  descriptor: { summary: 'Lift the live suspension of a moderator', tags: ['members'] },
  handler: async (context) => {
    const actor = await resolveActor(context)
    await liftSuspension(context.params.id, actor)

    await recordEvent({
      eventType: 'LiveSuspensionLifted',
      actorId: actor.id,
      subjectId: context.params.id,
      targetType: 'member',
      targetId: context.params.id,
      summary: context.params.id,
    })

    return { id: context.params.id }
  },
})
